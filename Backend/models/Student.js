const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, trim: true }, // matches User.username
    name: { type: String, required: true },
    className: { type: String, required: true }, // e.g. "Grade 10"
    section: { type: String, default: 'A' },
    guardianName: { type: String, default: '' },
    guardianPhone: { type: String, default: '' },
    email: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Student || mongoose.model('Student', StudentSchema);
