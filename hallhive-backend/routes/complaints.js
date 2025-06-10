const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * STUDENT: Submit a complaint
 * Body: { user_id, subject, content, is_anonymous }
 */
router.post('/', async (req, res) => {
     console.log("POST /api/complaints body:", req.body);
  const { user_id, subject, content, is_anonymous } = req.body;
  if (!user_id || !subject || !content) {
    return res.status(400).json({ message: "Missing required fields." });
  }
  try {
    await db.query(
      `INSERT INTO complaints (user_id, subject, content, is_anonymous)
       VALUES (?, ?, ?, ?)`,
      [user_id, subject, content, !!is_anonymous]
    );
    res.json({ message: "Complaint submitted." });
  } catch (err) {
  console.error("Error in POST /api/complaints:", err);
  res.status(500).json({ message: "Failed to submit complaint." });
}
});

/**
 * STUDENT: Get own complaints
 * param: user_id in URL
 */
router.get('/mine/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT id, subject, content AS description, is_anonymous AS anonymous, created_at AS timestamp, status, admin_feedback AS adminFeedback
       FROM complaints
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Could not load your complaints." });
  }
});

/**
 * ADMIN: Get all complaints (with student info, mask if anonymous)
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.subject, c.content AS description, c.is_anonymous AS anonymous, c.created_at AS timestamp, c.status, c.admin_feedback AS adminFeedback,
              u.name, u.registrationNumber AS studentId
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       ORDER BY c.created_at DESC`
    );
    // Mask student info if anonymous
    const masked = rows.map(row => ({
      ...row,
      name: row.anonymous ? undefined : row.name,
      studentId: row.anonymous ? undefined : row.studentId
    }));
    res.json(masked);
  } catch (err) {
    res.status(500).json({ message: "Could not load complaints." });
  }
});

/**
 * ADMIN: Update complaint status/feedback
 * Body: { status, adminFeedback }
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, adminFeedback } = req.body;
  try {
    await db.query(
      "UPDATE complaints SET status = ?, admin_feedback = ? WHERE id = ?",
      [status, adminFeedback, id]
    );
    res.json({ message: "Complaint updated." });
  } catch (err) {
    res.status(500).json({ message: "Update failed." });
  }
});

module.exports = router;