const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'hallhive_secret';

// Student Signup
router.post('/signup', async (req, res) => {
    try {
        const {
            name, session, department, registrationNumber,
            email, contactNumber, password, profilePicture, room_no
        } = req.body;

        // 1. Check if student is in allowed_students
        const [allowed] = await db.query(
            "SELECT * FROM allowed_students WHERE registrationNumber=? AND email=?",
            [registrationNumber, email]
        );
        if (!allowed.length) {
            return res.status(403).json({ message: "You are not an eligible student for signup." });
        }

        // 2. Check if already signed up
        const [exists] = await db.query(
            "SELECT id FROM users WHERE email=? OR registrationNumber=?",
            [email, registrationNumber]
        );
        if (exists.length) {
            return res.status(400).json({ message: "Email or Registration Number already registered." });
        }

        const hash = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO users (name, session, department, registrationNumber, email, contactNumber, password, role, profilePicture)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'student', ?)`,
            [name, session, department, registrationNumber, email, contactNumber, hash, profilePicture]
        );

        res.json({ message: "Signup successful!" });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Server error. Try again." });
    }
});

// Login (student/admin)
router.post('/login', async (req, res) => {
    try {
        const { email, registrationNumber, password, role } = req.body;
        let userRow;
        if (role === 'admin') {
    [userRow] = await db.query("SELECT * FROM users WHERE email=? AND role='admin'", [email]);
    if (!userRow.length) {
      console.log('Admin not found for', email);
    } else {
      console.log('Admin found:', userRow[0]);
    }
} else {
            [userRow] = await db.query(
                "SELECT * FROM users WHERE email=? AND registrationNumber=? AND role='student'",
                [email, registrationNumber]
            );
        }
        if (!userRow.length) {
          return res.status(400).json({ message: "User not found." });
        }
        const user = userRow[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return res.status(400).json({ message: "Incorrect password." });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        delete user.password;
        res.json({ message: "Login successful!", token, user });
    } catch (err) {
        res.status(500).json({ message: "Server error. Try again." });
    }
});

module.exports = router;