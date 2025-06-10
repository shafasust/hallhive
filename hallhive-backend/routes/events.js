const express = require('express');
const db = require('../db');
const router = express.Router();


// GET all events (public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, title, description, event_date, location, attachment FROM events ORDER BY event_date DESC`
    );
    // Format for frontend: use 'date' field
    const events = rows.map(ev => ({
      ...ev,
      date: ev.event_date, // frontend expects 'date'
    }));
    res.json(events);
  } catch (err) {
    console.error("GET /api/events error:", err);
    res.status(500).json({ message: "Could not load events." });
  }
});

// POST create event (admin)
router.post('/', async (req, res) => {
  const { title, description, date, location, attachment } = req.body;
  if (!title || !date) {
    return res.status(400).json({ message: "Title and date required." });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO events (title, description, event_date, location, attachment) VALUES (?, ?, ?, ?, ?)`,
      [title, description || "", date, location || "", attachment || ""]
    );
    // Respond with the created event
    res.json({
      id: result.insertId,
      title,
      description: description || "",
      date,
      location: location || "",
      attachment: attachment || ""
    });
  } catch (err) {
    console.error("POST /api/events error:", err);
    res.status(500).json({ message: "Failed to create event." });
  }
});

// DELETE event (admin)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM events WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/events/:id error:", err);
    res.status(500).json({ message: "Failed to delete event." });
  }
});

module.exports = router;