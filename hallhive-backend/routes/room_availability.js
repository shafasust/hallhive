const express = require('express');
const router = express.Router();
const db = require('../db');

// List all rooms and their current occupancy
router.get('/', async (req, res) => {
  const [rooms] = await db.query(
    `SELECT r.id, r.room_no, r.capacity, COUNT(ra.id) as occupancy
     FROM rooms r
     LEFT JOIN room_assignments ra ON ra.room_id = r.id
     GROUP BY r.id, r.room_no, r.capacity
     ORDER BY r.room_no ASC`
  );
  res.json(rooms);
});

module.exports = router;