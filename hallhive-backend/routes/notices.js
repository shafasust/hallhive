const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all notices
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, title, content, attachment, created_at FROM notices ORDER BY created_at DESC');
    res.json(rows.map(row => ({
      ...row, _id: row.id // For frontend compatibility
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

// Create a new notice
router.post('/', async (req, res) => {
  const { title, content, attachment } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO notices (title, content, attachment) VALUES (?, ?, ?)',
      [title, content, attachment]
    );
    const [notices] = await db.query('SELECT id, title, content, attachment, created_at FROM notices WHERE id = ?', [result.insertId]);
    res.json({ ...notices[0], _id: notices[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notice' });
  }
});

// Update a notice
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, attachment } = req.body;
  try {
    await db.query(
      'UPDATE notices SET title=?, content=?, attachment=? WHERE id=?',
      [title, content, attachment, id]
    );
    const [notices] = await db.query('SELECT id, title, content, attachment, created_at FROM notices WHERE id = ?', [id]);
    res.json({ ...notices[0], _id: notices[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notice' });
  }
});

// Delete a notice
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM notices WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notice' });
  }
});

module.exports = router;