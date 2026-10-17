require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Student = require('./models/Student');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');
const Salary = require('./models/Salary');
const Announcement = require('./models/Announcement');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hssmart';

const STUDENTS = [
  { studentId: 'student123', name: 'Aarav Mehta', className: 'Grade 10', section: 'A', guardianName: 'Rohit Mehta', guardianPhone: '98765 43210' },
  { studentId: 'student124', name: 'Diya Sharma', className: 'Grade 10', section: 'A', guardianName: 'Neha Sharma', guardianPhone: '98765 43211' },
  { studentId: 'student125', name: 'Kabir Nair', className: 'Grade 10', section: 'B', guardianName: 'Suresh Nair', guardianPhone: '98765 43212' },
  { studentId: 'student126', name: 'Ira Kapoor', className: 'Grade 9', section: 'A', guardianName: 'Anil Kapoor', guardianPhone: '98765 43213' },
];

const EMPLOYEES = [
  { employeeId: 'teacher01', name: 'Priya Iyer', role: 'teacher', department: 'Grade 10', designation: 'Class Teacher', baseSalary: 45000 },
  { employeeId: 'teacher02', name: 'Arjun Verma', role: 'teacher', department: 'Grade 9', designation: 'Subject Teacher', baseSalary: 42000 },
  { employeeId: 'hradmin', name: 'Meera Pillai', role: 'hr', department: 'Administration', designation: 'HR Manager', baseSalary: 55000 },
  { employeeId: 'mdmaster', name: 'Dr. Vikram Rao', role: 'md', department: 'Leadership', designation: 'Managing Director', baseSalary: 90000 },
];

const PASSWORDS = {
  student123: 'password', student124: 'password', student125: 'password', student126: 'password',
  teacher01: 'teach@123', teacher02: 'teach@123',
  hradmin: 'hr@123',
  mdmaster: 'md@2024',
};

async function upsertUser(username, name, role) {
  const hashed = await bcrypt.hash(PASSWORDS[username], 10);
  await User.findOneAndUpdate(
    { username, role },
    { username, name, role, password: hashed },
    { upsert: true, setDefaultsOnInsert: true }
  );
}

function dateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

async function seed() {
  await mongoose.connect(uri);
  console.log('Connected. Seeding...');

  const students = [];
  for (const s of STUDENTS) {
    const doc = await Student.findOneAndUpdate({ studentId: s.studentId }, s, { upsert: true, new: true, setDefaultsOnInsert: true });
    await upsertUser(s.studentId, s.name, 'student');
    students.push(doc);
  }

  const employees = [];
  for (const e of EMPLOYEES) {
    const doc = await Employee.findOneAndUpdate({ employeeId: e.employeeId }, e, { upsert: true, new: true, setDefaultsOnInsert: true });
    await upsertUser(e.employeeId, e.name, e.role);
    employees.push(doc);
  }

  // 14 days of attendance history for students (weighted mostly present)
  const ops = [];
  for (let d = 13; d >= 0; d--) {
    const date = dateStr(d);
    for (const s of students) {
      const roll = Math.random();
      const status = roll > 0.88 ? 'absent' : roll > 0.8 ? 'leave' : 'present';
      ops.push({
        updateOne: {
          filter: { person: s._id, date },
          update: { $set: { personType: 'Student', person: s._id, personLabel: s.name, group: s.className, date, status, markedBy: 'Priya Iyer' } },
          upsert: true,
        },
      });
    }
  }
  if (ops.length) await Attendance.bulkWrite(ops);

  // This month's payroll
  const now = new Date();
  for (const e of employees) {
    const netPay = e.baseSalary;
    await Salary.findOneAndUpdate(
      { employee: e._id, month: now.getMonth() + 1, year: now.getFullYear() },
      { employee: e._id, employeeLabel: e.name, month: now.getMonth() + 1, year: now.getFullYear(), baseSalary: e.baseSalary, bonus: 0, deductions: 0, netPay, status: 'pending' },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  await Announcement.findOneAndUpdate(
    { title: 'Welcome to HS ERP' },
    {
      title: 'Welcome to HS ERP',
      message: 'This is your campus management suite — attendance, people records, payroll, reports and notices all in one place.',
      postedBy: 'Dr. Vikram Rao',
      postedByRole: 'md',
      audience: ['all'],
    },
    { upsert: true }
  );

  console.log(`Seeded ${students.length} students, ${employees.length} employees, attendance history and payroll.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
