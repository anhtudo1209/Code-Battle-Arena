import express from "express";
import { query } from "../database/db-postgres.js";

const router = express.Router();

// Create a new ticket
router.post("/", async (req, res) => {
    const { subject, content } = req.body;
    const userId = req.userId;

    if (!subject || !content) {
        return res.status(400).json({ error: "Subject and content are required" });
    }

    try {
        const result = await query(
            `INSERT INTO tickets (user_id, subject, content, status)
       VALUES ($1, $2, $3, 'open')
       RETURNING *`,
            [userId, subject, content]
        );

        res.json({ success: true, ticket: result.rows[0] });
    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({ error: "Failed to create ticket" });
    }
});

// Get user's tickets
router.get("/", async (req, res) => {
    const userId = req.userId;

    try {
        const result = await query(
            `SELECT * FROM tickets WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );

        res.json({ tickets: result.rows });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ error: "Failed to fetch tickets" });
    }
});

export default router;
