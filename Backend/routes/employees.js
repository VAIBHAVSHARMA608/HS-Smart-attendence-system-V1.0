const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Employee = require('../models/Employee');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

// HR/MD see the full staff list. A teacher sees only their own record.
router.get('/', async (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      const me = await Employee.findOne({ employeeId: req.user.username });
      return res.json(me ? [me] : []);
    }
    if (!['hr', 'md'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not permitted for your role' });
    }
    const { role, q } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (q) filter.name = { $regex: q, $options: 'i' };
    const employees = await Employee.find(filter).sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', requireRole('hr', 'md'), async (req, res) => {
  try {
    const { employeeId, name, role, department, designation, phone, email, baseSalary, password } = req.body;
    if (!employeeId || !name || !role || !password) {
      return res.status(400).json({ success: false, message: 'employeeId, name, role and password are required' });
    }
    const employee = await Employee.create({ employeeId, name, role, department, designation, phone, email, baseSalary });
    const hashed = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { username: employeeId, role },
      { username: employeeId, name, role, password: hashed },
      { upsert: true }
    );
    res.status(201).json({ success: true, employee });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Employee ID already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', requireRole('hr', 'md'), async (req, res) => {
  try {
    const { name, department, designation, phone, email, baseSalary, status } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, department, designation, phone, email, baseSalary, status },
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    if (name) await User.findOneAndUpdate({ username: employee.employeeId, role: employee.role }, { name });
    res.json({ success: true, employee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', requireRole('hr', 'md'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    await User.deleteOne({ username: employee.employeeId, role: employee.role });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
