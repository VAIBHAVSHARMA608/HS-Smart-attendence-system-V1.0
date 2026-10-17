const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Salary = require('../models/Salary');
const Announcement = require('../models/Announcement');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function attendanceRate(match) {
  const rows = await Attendance.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
  const total = rows.reduce((s, r) => s + r.count, 0);
  const present = rows.find((r) => r._id === 'present')?.count || 0;
  return total ? Math.round((present / total) * 100) : 0;
}

router.get('/stats', async (req, res) => {
  try {
    const { role, username } = req.user;
    const announcements = await Announcement.find({ audience: { $in: ['all', role] } })
      .sort({ createdAt: -1 })
      .limit(5);

    if (role === 'student') {
      const me = await Student.findOne({ studentId: username });
      const monthStart = today().slice(0, 7) + '-01';
      const rate = me ? await attendanceRate({ person: me._id, date: { $gte: monthStart } }) : 0;
      const totalMarked = me ? await Attendance.countDocuments({ person: me._id }) : 0;
      return res.json({
        role,
        stats: [
          { label: 'Attendance this month', value: `${rate}%`, tone: rate >= 75 ? 'sage' : 'clay' },
          { label: 'Class', value: me?.className || '—' },
          { label: 'Days recorded', value: totalMarked },
        ],
        announcements,
      });
    }

    if (role === 'teacher') {
      const me = await Employee.findOne({ employeeId: username });
      const classGroup = me?.department || '';
      const studentCount = classGroup ? await Student.countDocuments({ className: classGroup }) : await Student.countDocuments();
      const rate = await attendanceRate({ personType: 'Student', date: today(), ...(classGroup ? { group: classGroup } : {}) });
      return res.json({
        role,
        stats: [
          { label: 'Students', value: studentCount },
          { label: "Today's attendance", value: `${rate}%`, tone: rate >= 75 ? 'sage' : 'clay' },
          { label: 'Department', value: me?.department || '—' },
        ],
        announcements,
      });
    }

    // hr / md
    const [studentCount, employeeCount, pendingSalary, todayRate] = await Promise.all([
      Student.countDocuments(),
      Employee.countDocuments(),
      Salary.countDocuments({ status: 'pending' }),
      attendanceRate({ date: today() }),
    ]);
    const payrollAgg = await Salary.aggregate([
      { $match: { month: new Date().getMonth() + 1, year: new Date().getFullYear() } },
      { $group: { _id: null, total: { $sum: '$netPay' } } },
    ]);
    res.json({
      role,
      stats: [
        { label: 'Students', value: studentCount },
        { label: 'Staff', value: employeeCount },
        { label: "Today's attendance", value: `${todayRate}%`, tone: todayRate >= 75 ? 'sage' : 'clay' },
        { label: 'Pending payroll', value: pendingSalary, tone: pendingSalary ? 'clay' : 'sage' },
      ],
      payrollThisMonth: payrollAgg[0]?.total || 0,
      announcements,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
