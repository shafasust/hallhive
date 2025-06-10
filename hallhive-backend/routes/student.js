const express = require('express');
const db = require('../db');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.get('/me', authenticate('student'), async (req, res) => {
  const id = req.user.id;
  // Join with allowed_students to get the room_no
  const [rows] = await db.query(
    `SELECT u.id, u.name, u.session, u.department, u.registrationNumber, u.email, u.contactNumber, u.profilePicture, u.created_at, a.room_no
     FROM users u
     LEFT JOIN allowed_students a ON u.registrationNumber = a.registrationNumber
     WHERE u.id=? AND u.role='student'`,
    [id]
  );
  if (!rows.length) return res.status(404).json({ message: "Student not found" });

  const student = rows[0];
  res.json({
    id: student.id,
    name: student.name,
    batch: student.session,
    department: student.department,
    studentId: student.registrationNumber,
    roomNo: student.room_no,            // Include room_no here!
    email: student.email,
    phone: student.contactNumber,
    profilePicture: student.profilePicture,
    createdAt: student.created_at
  });
});

module.exports = router;