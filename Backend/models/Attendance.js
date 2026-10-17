const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    personType: { type: String, required: true, enum: ['Student', 'Employee'] },
    person: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'personType' },
    personLabel: { type: String, required: true }, // denormalized name, for fast listing
    group: { type: String, default: '' }, // class name or department, for filtering
    date: { type: String, required: true }, // 'YYYY-MM-DD', simplest for day-based marking
    status: { type: String, required: true, enum: ['present', 'absent', 'leave', 'half-day'] },
    markedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

AttendanceSchema.index({ person: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
