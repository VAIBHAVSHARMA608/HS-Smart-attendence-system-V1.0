const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true }, // matches User.username
    name: { type: String, required: true },
    role: { type: String, required: true, enum: ['teacher', 'hr', 'md'] },
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    joinDate: { type: Date, default: Date.now },
    baseSalary: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
