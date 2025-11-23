import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../database/db-postgres.js";
import authMiddleware from "../middleware/authMiddleware.js";

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
        return res.status(400).send({ message: "Username exists"});
    }

    const emailExists = await query("SELECT id from users WHERE email = $1", [email]);
    if (emailExists.rows.length > 0) {
        return res.status(400).send({ message: "Email already registered"});
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

// Get current user info (requires auth middleware)
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const result = await query(
            "SELECT id, username, email, role, created_at FROM users WHERE id = $1",
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

export default router;
