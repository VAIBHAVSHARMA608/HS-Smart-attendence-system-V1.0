const express = require('express');
const router = express.Router();
const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    if (req.user.role === 'teacher') {
      const me = await Employee.findOne({ employeeId: req.user.username });
      filter.employee = me ? me._id : null;
    } else if (!['hr', 'md'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not permitted for your role' });
    }

    const records = await Salary.find(filter).sort({ year: -1, month: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', requireRole('hr', 'md'), async (req, res) => {
  try {
    const { employee, employeeLabel, month, year, baseSalary, bonus = 0, deductions = 0 } = req.body;
    if (!employee || !month || !year || baseSalary == null) {
      return res.status(400).json({ success: false, message: 'employee, month, year and baseSalary are required' });
    }
    const netPay = Number(baseSalary) + Number(bonus) - Number(deductions);
    const record = await Salary.findOneAndUpdate(
      { employee, month, year },
      { employee, employeeLabel, month, year, baseSalary, bonus, deductions, netPay },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id/pay', requireRole('hr', 'md'), async (req, res) => {
  try {
    const record = await Salary.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidOn: new Date() },
      { new: true }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
