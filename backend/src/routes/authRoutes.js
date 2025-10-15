import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../database/db.js";

const router = express.Router();
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
        const insertUser = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        const result = insertUser.run(username, email, hashedPassword);
        const userId = result.lastInsertRowid;
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
        return res.status(201).json({ token });
    } catch (err) {
        return res.sendStatus(503);
    }
})
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const getUser = db.prepare("SELECT * FROM users WHERE username = ?");
        const user = getUser.get(username);
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
        return res.sendStatus(503);
    }
})
router.post("/oauth-login", async (req, res) => {
    const { provider, provider_user_id, email, username } = req.body;

    try {
        const getOAuth = db.prepare(`
            SELECT * FROM oauth_accounts WHERE provider = ? AND provider_user_id = ?
        `).get(provider, provider_user_id);

        let userId;

        if (getOAuth) {
            userId = getOAuth.user_id;
        } else {
            const getUser = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);

            if (getUser) {
                userId = getUser.id;
            } else {
                const insertUser = db.prepare(`
                    INSERT INTO users (username, email, password) VALUES (?, ?, ?)
                `);
                const result = insertUser.run(username || email, email, ""); // password để trống cho OAuth
                userId = result.lastInsertRowid;
            }

            const insertOAuth = db.prepare(`
                INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
                VALUES (?, ?, ?)
            `);
            insertOAuth.run(userId, provider, provider_user_id);
        }
        const allUsers = db.prepare(`SELECT * FROM users`).all();
        const allOAuth = db.prepare(`SELECT * FROM oauth_accounts`).all();
        console.log("📊 Users table:", allUsers);
        console.log("📊 OAuth_accounts table:", allOAuth);

        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
        return res.json({ token });

    } catch (err) {
        console.error("OAuth login error:", err);
        return res.sendStatus(503);
    }
});

export default router;