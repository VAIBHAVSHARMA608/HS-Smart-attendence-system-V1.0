const mongoose = require('mongoose');

const SalarySchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    employeeLabel: { type: String, required: true },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    baseSalary: { type: Number, required: true },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netPay: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paidOn: { type: Date },
  },
  { timestamps: true }
);

SalarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.models.Salary || mongoose.model('Salary', SalarySchema);
