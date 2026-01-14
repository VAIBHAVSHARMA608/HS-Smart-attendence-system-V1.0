const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Universal login route
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;
  const user = await User.findOne({ username, password, role });
  if (user) res.json({ success: true, role: user.role });
  else res.json({ success: false, message: 'Invalid credentials' });
});

// Example for student login
fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: studentId,
    password: studentPassword,
    role: 'student' // or 'teacher', 'hr', 'md'
  })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    // Save login flag and redirect
    localStorage.setItem('studentLoggedIn', 'true');
    window.location.href = "dashboard.html";
  } else {
    alert(data.message);
  }
});

module.exports = router;