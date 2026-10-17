const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

// Teacher/HR/MD see the full roster. A student sees only their own record.
router.get('/', async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const me = await Student.findOne({ studentId: req.user.username });
      return res.json(me ? [me] : []);
    }
    const { className, q } = req.query;
    const filter = {};
    if (className) filter.className = className;
    if (q) filter.name = { $regex: q, $options: 'i' };
    const students = await Student.find(filter).sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', requireRole('hr', 'md'), async (req, res) => {
  try {
    const { studentId, name, className, section, guardianName, guardianPhone, email, password } = req.body;
    if (!studentId || !name || !className || !password) {
      return res.status(400).json({ success: false, message: 'studentId, name, className and password are required' });
    }

    const student = await Student.create({ studentId, name, className, section, guardianName, guardianPhone, email });
    const hashed = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { username: studentId, role: 'student' },
      { username: studentId, name, role: 'student', password: hashed },
      { upsert: true }
    );
    res.status(201).json({ success: true, student });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Student ID already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', requireRole('hr', 'md'), async (req, res) => {
  try {
    const { name, className, section, guardianName, guardianPhone, email, status } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, className, section, guardianName, guardianPhone, email, status },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (name) await User.findOneAndUpdate({ username: student.studentId, role: 'student' }, { name });
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', requireRole('hr', 'md'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    await User.deleteOne({ username: student.studentId, role: 'student' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
