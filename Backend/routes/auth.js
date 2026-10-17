const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ success: false, message: 'Username, password and role are required' });
    }

    const user = await User.findOne({ username: username.trim(), role });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username, password or role' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid username, password or role' });
    }

    const payload = { id: user._id, username: user.username, name: user.name, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
    res.json({ success: true, token, user: payload });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/me', verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
