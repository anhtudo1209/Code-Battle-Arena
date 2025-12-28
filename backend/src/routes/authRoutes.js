import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { query } from "../database/db-postgres.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendPasswordResetEmail } from "../utils/email.js";

const generateAccessToken = (userId) => jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
const generateRefreshToken = (userId) => jwt.sign({ id: userId, type: 'refresh' }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

const router = express.Router();

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    // Username validation: 6-20 characters
    if (!username || username.length < 6 || username.length > 20) {
        return res.status(400).send({ message: "Username must be 6-20 characters" });
    }

    // Username pattern: alphanumeric, underscore, hyphen only
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).send({ message: "Username can only contain letters, numbers, underscore, and hyphen" });
    }

    // Password validation: minimum 8 characters, at least 1 letter and 1 number
    if (!password || password.length < 8) {
        return res.status(400).send({ message: "Password must be at least 8 characters" });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
        return res.status(400).send({ message: "Password must contain at least 1 letter and 1 number" });
    }

    const usernameExists = await query("SELECT id from users WHERE username = $1", [username]);
    if (usernameExists.rows.length > 0) {
        return res.status(400).send({ message: "Username exists" });
    }

    const emailExists = await query("SELECT id from users WHERE email = $1", [email]);
    if (emailExists.rows.length > 0) {
        return res.status(400).send({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const result = await query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
            [username, email, hashedPassword]
        );
        const userId = result.rows[0].id;
        const accessToken = generateAccessToken(userId);
        const refreshToken = generateRefreshToken(userId);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await query("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)", [userId, refreshToken, expiresAt]);
        return res.status(201).json({ accessToken, refreshToken });
    } catch (err) {
        console.error("Registration error:", err);
        return res.status(503).json({ error: "Registration failed" });
    }
});
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await query("SELECT * FROM users WHERE username = $1", [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ message: "Invalid credentials" });
        }

        // Revoke old refresh tokens
        await query("DELETE FROM refresh_tokens WHERE user_id = $1", [user.id]);

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await query("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)", [user.id, refreshToken, expiresAt]);
        return res.json({ accessToken, refreshToken });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(503).json({ error: "Login failed" });
    }
});
router.post("/oauth-login", async (req, res) => {
    const { provider, provider_user_id, email, username } = req.body;

    try {
        // Check if OAuth account exists
        const oauthResult = await query(
            "SELECT * FROM oauth_accounts WHERE provider = $1 AND provider_user_id = $2",
            [provider, provider_user_id]
        );
        const oauthAccount = oauthResult.rows[0];

        let userId;

        if (oauthAccount) {
            // OAuth account exists, use the linked user
            userId = oauthAccount.user_id;
        } else {
            // Check if user exists by email
            const userResult = await query("SELECT * FROM users WHERE email = $1", [email]);
            const existingUser = userResult.rows[0];

            if (existingUser) {
                // User exists, link OAuth account
                userId = existingUser.id;
            } else {
                // Create new user for OAuth
                const newUserResult = await query(
                    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
                    [username || email, email, ""] // Empty password for OAuth
                );
                userId = newUserResult.rows[0].id;
            }

            // Link OAuth account to user
            await query(
                "INSERT INTO oauth_accounts (user_id, provider, provider_user_id) VALUES ($1, $2, $3)",
                [userId, provider, provider_user_id]
            );
        }

        // Revoke old refresh tokens
        await query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);

        const accessToken = generateAccessToken(userId);
        const refreshToken = generateRefreshToken(userId);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await query("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)", [userId, refreshToken, expiresAt]);
        return res.json({ accessToken, refreshToken });

    } catch (err) {
        console.error("OAuth login error:", err);
        return res.status(503).json({ error: "OAuth login failed" });
    }
});

router.post("/refresh", async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token required" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (decoded.type !== 'refresh') {
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        const userId = decoded.id;

        // Check if refresh token exists in database
        const tokenResult = await query("SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2", [refreshToken, userId]);
        if (tokenResult.rows.length === 0) {
            return res.status(401).json({ error: "Refresh token not found" });
        }

        const tokenRecord = tokenResult.rows[0];
        if (new Date() > new Date(tokenRecord.expires_at)) {
            return res.status(401).json({ error: "Refresh token expired" });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(userId);

        // Optionally rotate refresh token
        const newRefreshToken = generateRefreshToken(userId);
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Update refresh token in database
        await query("UPDATE refresh_tokens SET token = $1, expires_at = $2 WHERE id = $3", [newRefreshToken, newExpiresAt, tokenRecord.id]);

        return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        console.error("Refresh token error:", err);
        return res.status(401).json({ error: "Invalid refresh token" });
    }
});

router.post("/logout", async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token required" });
    }

    try {
        // Delete the refresh token from database
        await query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken]);
        return res.json({ message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout error:", err);
        return res.status(503).json({ error: "Logout failed" });
    }
});

// Get leaderboard (top 5 users by rating)
router.get("/leaderboard", async (req, res) => {
    try {
        const result = await query(
            "SELECT username, rating FROM users ORDER BY rating DESC LIMIT 5"
        );
        res.json({ leaderboard: result.rows });
    } catch (err) {
        console.error("Leaderboard error:", err);
        return res.status(500).json({ error: "Failed to get leaderboard" });
    }
});

// Get current user info (requires auth middleware)
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const result = await query(
            "SELECT id, username, email, role, rating, win_streak, loss_streak, daily_streak, display_name, avatar_animal, avatar_color, created_at FROM users WHERE id = $1",
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error("Get user error:", err);
        return res.status(500).json({ error: "Failed to get user info" });
    }
});

// Valid animals and colors for avatar selection
const VALID_ANIMALS = [
    'alligator', 'anteater', 'armadillo', 'axolotl', 'badger', 'bat', 'beaver',
    'buffalo', 'camel', 'capybara', 'chameleon', 'cheetah', 'chinchilla', 'chipmunk',
    'cormorant', 'coyote', 'crow', 'dingo', 'dinosaur', 'dolphin', 'dragon',
    'duck', 'elephant', 'ferret', 'fox', 'frog', 'giraffe', 'goose', 'gopher', 'grizzly',
    'hamster', 'hedgehog', 'hippo', 'hyena', 'ibex', 'iguana', 'jackal', 'kangaroo',
    'koala', 'kraken', 'lemur', 'leopard', 'liger', 'llama', 'manatee', 'mink',
    'monkey', 'moose', 'narwhal', 'orangutan', 'otter', 'panda', 'penguin', 'platypus',
    'python', 'quagga', 'rabbit', 'raccoon', 'rhino', 'sheep', 'shrew', 'skunk',
    'squirrel', 'tiger', 'turtle', 'unicorn', 'walrus', 'wolf', 'wolverine', 'wombat'
];
const VALID_COLORS = ['red', 'orange', 'yellow', 'green', 'purple', 'teal'];

// Update user profile (display_name, avatar_animal, avatar_color)
router.put("/profile", authMiddleware, async (req, res) => {
    const { display_name, avatar_animal, avatar_color } = req.body;

    try {
        // Validate display_name if provided
        if (display_name !== undefined) {
            if (display_name.length > 50) {
                return res.status(400).json({ error: "Display name must be 50 characters or less" });
            }
        }

        // Validate avatar_animal if provided
        if (avatar_animal !== undefined && !VALID_ANIMALS.includes(avatar_animal)) {
            return res.status(400).json({ error: "Invalid animal selection" });
        }

        // Validate avatar_color if provided
        if (avatar_color !== undefined && !VALID_COLORS.includes(avatar_color)) {
            return res.status(400).json({ error: "Invalid color selection" });
        }

        await query(
            `UPDATE users SET 
                display_name = COALESCE($1, display_name), 
                avatar_animal = COALESCE($2, avatar_animal), 
                avatar_color = COALESCE($3, avatar_color), 
                updated_at = CURRENT_TIMESTAMP 
             WHERE id = $4`,
            [display_name || null, avatar_animal || null, avatar_color || null, req.userId]
        );

        // Return updated user
        const result = await query(
            "SELECT id, username, display_name, avatar_animal, avatar_color FROM users WHERE id = $1",
            [req.userId]
        );

        res.json({ message: "Profile updated", user: result.rows[0] });
    } catch (err) {
        console.error("Update profile error:", err);
        return res.status(500).json({ error: "Failed to update profile" });
    }
});

// Forgot password - send reset email
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        // Check if user exists
        const userResult = await query("SELECT id FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            // Don't reveal if email exists or not for security
            return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
        }

        const userId = userResult.rows[0].id;

        // Delete any existing reset tokens for this user
        await query("DELETE FROM password_reset_tokens WHERE user_id = $1", [userId]);

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save reset token
        await query(
            "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
            [userId, resetToken, expiresAt]
        );

        // Send reset email
        const emailSent = await sendPasswordResetEmail(email, resetToken);
        if (!emailSent) {
            return res.status(500).json({ error: "Failed to send reset email" });
        }

        res.json({ message: "If an account with that email exists, a password reset link has been sent." });
    } catch (err) {
        console.error("Forgot password error:", err);
        return res.status(500).json({ error: "Failed to process password reset request" });
    }
});

// Reset password using token
router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
    }

    // Password validation: minimum 8 characters, at least 1 letter and 1 number
    if (newPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ error: "Password must contain at least 1 letter and 1 number" });
    }

    try {
        // Find and validate reset token
        const tokenResult = await query(
            "SELECT * FROM password_reset_tokens WHERE token = $1",
            [token]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }

        const tokenRecord = tokenResult.rows[0];
        if (new Date() > new Date(tokenRecord.expires_at)) {
            return res.status(400).json({ error: "Reset token has expired" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        await query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, tokenRecord.user_id]);

        // Delete used reset token
        await query("DELETE FROM password_reset_tokens WHERE id = $1", [tokenRecord.id]);

        res.json({ message: "Password reset successfully" });
    } catch (err) {
        console.error("Reset password error:", err);
        return res.status(500).json({ error: "Failed to reset password" });
    }
});

// Change password
router.put("/change-password", authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password are required" });
    }

    // Password validation
    if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ message: "Password must contain at least 1 letter and 1 number" });
    }

    try {
        const result = await query("SELECT password FROM users WHERE id = $1", [req.userId]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Incorrect current password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, req.userId]);

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Change password error:", err);
        return res.status(500).json({ message: "Failed to update password" });
    }
});

// Delete account
router.delete("/delete-account", authMiddleware, async (req, res) => {
    const userId = req.userId;
    try {
        // 1. Confirm user exists
        const userResult = await query("SELECT id FROM users WHERE id = $1", [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Delete user
        // Database is configured with ON DELETE CASCADE for all related tables (battles, submissions, etc.)
        await query("DELETE FROM users WHERE id = $1", [userId]);

        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({ message: "Server error during account deletion" });
    }
});

export default router;