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
        // Start a transaction (conceptually, though using simple queries for now)
        // 1. Create ticket
        const ticketResult = await query(
            `INSERT INTO tickets (user_id, subject, content, status)
       VALUES ($1, $2, $3, 'open')
       RETURNING *`,
            [userId, subject, content]
        );
        const ticket = ticketResult.rows[0];

        // 2. Create initial message
        await query(
            `INSERT INTO ticket_messages (ticket_id, sender_id, message)
       VALUES ($1, $2, $3)`,
            [ticket.id, userId, content]
        );

        res.json({ success: true, ticket });
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

// Get single ticket details with messages
router.get("/:id", async (req, res) => {
    const ticketId = req.params.id;
    const userId = req.userId;

    try {
        // 1. Get ticket (ensure ownership)
        const ticketResult = await query(
            `SELECT * FROM tickets WHERE id = $1 AND user_id = $2`,
            [ticketId, userId]
        );

        if (ticketResult.rows.length === 0) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        // 2. Get messages
        const messagesResult = await query(
            `SELECT tm.*, u.username, u.role
       FROM ticket_messages tm
       LEFT JOIN users u ON tm.sender_id = u.id
       WHERE tm.ticket_id = $1
       ORDER BY tm.created_at ASC`,
            [ticketId]
        );

        res.json({
            ticket: ticketResult.rows[0],
            messages: messagesResult.rows
        });
    } catch (error) {
        console.error("Error fetching ticket details:", error);
        res.status(500).json({ error: "Failed to fetch ticket details" });
    }
});

// Add message to ticket
router.post("/:id/message", async (req, res) => {
    const ticketId = req.params.id;
    const userId = req.userId;
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message content is required" });
    }

    try {
        // Verify ownership
        const ticketCheck = await query(
            `SELECT id FROM tickets WHERE id = $1 AND user_id = $2`,
            [ticketId, userId]
        );

        if (ticketCheck.rows.length === 0) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        // Insert message
        const msgResult = await query(
            `INSERT INTO ticket_messages (ticket_id, sender_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [ticketId, userId, message]
        );

        // Update ticket updated_at
        await query(
            `UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [ticketId]
        );

        res.json({ success: true, message: msgResult.rows[0] });
    } catch (error) {
        console.error("Error adding message:", error);
        res.status(500).json({ error: "Failed to add message" });
    }
});

export default router;
