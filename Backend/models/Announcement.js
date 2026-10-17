const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    postedBy: { type: String, required: true },
    postedByRole: { type: String, required: true },
    audience: {
      type: [String],
      default: ['all'], // subset of ['all','student','teacher','hr','md']
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
