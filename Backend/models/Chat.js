const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  fromRole: String, // 'student', 'teacher', 'hr', 'md'
  fromName: String, // username or display name
  message: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
