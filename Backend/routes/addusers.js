const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');

// Create a user (or several). Guarded by ADMIN_SEED_SECRET so this can't be
// hit by random visitors once the app is public on Vercel.
router.post('/', async (req, res) => {
  try {
    const secret = req.headers['x-seed-secret'];
    if (!process.env.ADMIN_SEED_SECRET || secret !== process.env.ADMIN_SEED_SECRET) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const usersInput = Array.isArray(req.body) ? req.body : [req.body];
    const created = [];
    for (const u of usersInput) {
      const { username, password, role } = u;
      if (!username || !password || !role) continue;
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.findOneAndUpdate(
        { username, role },
        { username, password: hashed, role },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      created.push({ username: user.username, role: user.role });
    }

    res.json({ success: true, created });
  } catch (err) {
    console.error('Add users error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
