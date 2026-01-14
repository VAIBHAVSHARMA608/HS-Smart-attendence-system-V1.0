const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String // 'student', 'teacher', 'hr', 'md'
});

module.exports = mongoose.model('User', UserSchema);