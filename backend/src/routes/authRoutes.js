import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../database/db-postgres.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    
    // Username validation: 6-20 characters
    if (!username || username.length < 6 || username.length > 20) {
        return res.status(400).json({ error: "Username must be 6-20 characters" });
    }
    
    // Username pattern: alphanumeric, underscore, hyphen only
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ error: "Username can only contain letters, numbers, underscore, and hyphen" });
    }
    
    // Password validation: minimum 8 characters, at least 1 letter and 1 number
    if (!password || password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: "Password must contain at least 1 letter and 1 number" });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
        const result = await query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
            [username, email, hashedPassword]
        );
        const userId = result.rows[0].id;
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
        return res.status(201).json({ token });
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
        
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ message: "Invalid credentials" });
        }
        
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "24h" });
        return res.json({ token });
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

        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
        return res.json({ token });

    } catch (err) {
        console.error("OAuth login error:", err);
        return res.status(503).json({ error: "OAuth login failed" });
    }
});

export default router;