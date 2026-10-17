const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Employee = require('../models/Employee');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

// Bulk-mark attendance for one date. Teachers mark students, HR/MD can mark
// either students or staff.
router.post('/mark', requireRole('teacher', 'hr', 'md'), async (req, res) => {
  try {
    const { date, personType, records } = req.body;
    if (!date || !personType || !Array.isArray(records) || !records.length) {
      return res.status(400).json({ success: false, message: 'date, personType and records[] are required' });
    }

    const ops = records.map((r) => ({
      updateOne: {
        filter: { person: r.person, date },
        update: {
          $set: {
            personType,
            person: r.person,
            personLabel: r.personLabel,
            group: r.group || '',
            date,
            status: r.status,
            markedBy: req.user.name,
          },
        },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(ops);
    res.json({ success: true, count: records.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// List attendance for a date (+ optional group filter), for marking UIs and
// the org-wide attendance table.
router.get('/', async (req, res) => {
  try {
    const { date, personType, group } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (personType) filter.personType = personType;
    if (group) filter.group = group;

    if (req.user.role === 'student') {
      const me = await Student.findOne({ studentId: req.user.username });
      filter.person = me ? me._id : null;
    } else if (req.user.role === 'teacher') {
      const me = await Employee.findOne({ employeeId: req.user.username });
      if (personType === 'Employee') {
        // Teachers can only ever see their own payroll/attendance row, never a colleague's.
        filter.person = me ? me._id : null;
      } else {
        // Restrict to their own class — ignore any caller-supplied group so a
        // teacher can't query another class's attendance.
        filter.personType = 'Student';
        filter.group = me?.department || '__none__';
      }
    }

    const records = await Attendance.find(filter).sort({ date: -1 }).limit(500);
    res.json(records);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Attendance summary (counts by status) for dashboards/reports.
router.get('/summary', async (req, res) => {
  try {
    const { personType, group, from, to } = req.query;
    const match = {};
    if (personType) match.personType = personType;
    if (group) match.group = group;
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = from;
      if (to) match.date.$lte = to;
    }
    if (req.user.role === 'student') {
      const me = await Student.findOne({ studentId: req.user.username });
      match.person = me ? me._id : null;
    } else if (req.user.role === 'teacher') {
      const me = await Employee.findOne({ employeeId: req.user.username });
      match.personType = 'Student';
      match.group = me?.department || '__none__';
    }

    const rows = await Attendance.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const summary = { present: 0, absent: 0, leave: 0, 'half-day': 0 };
    rows.forEach((r) => { summary[r._id] = r.count; });
    res.json(summary);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
