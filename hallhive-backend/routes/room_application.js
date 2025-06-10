const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  try {
    console.log('Request received:', { user_id: req.user?.id, room_no: req.body.room_no });
    const user_id = req.user.id;
    const { room_no } = req.body;
    if (!user_id || !room_no) {
      console.log('Missing data:', { user_id, room_no });
      return res.status(400).json({ message: "user_id and room_no required" });
    }

    console.log('Checking room:', room_no);
    const [[room]] = await db.query("SELECT id, capacity FROM rooms WHERE room_no = ?", [room_no]);
    if (!room) {
      console.log('Room not found:', room_no);
      return res.status(404).json({ message: "Room not found" });
    }

    console.log('Checking occupancy for room_id:', room.id);
    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) as count FROM room_assignments WHERE room_id = ?",
      [room.id]
    );
    if (count >= room.capacity) {
      console.log('Room is full:', room_no);
      return res.status(400).json({ message: "Room is already full." });
    }

    console.log('Checking existing application for user_id:', user_id);
    const [[existing]] = await db.query(
      "SELECT * FROM room_applications WHERE user_id = ? AND status = 'pending'",
      [user_id]
    );
    if (existing) {
      console.log('Existing application found:', existing);
      return res.status(400).json({ message: "You already have a pending application." });
    }

    console.log('Inserting application:', { user_id, room_id: room.id });
    await db.query(
      "INSERT INTO room_applications (user_id, room_id) VALUES (?, ?)",
      [user_id, room.id]
    );
    console.log('Application inserted successfully');
    res.json({ success: true });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;