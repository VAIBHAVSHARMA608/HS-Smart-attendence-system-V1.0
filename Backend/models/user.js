const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // stored as a bcrypt hash
  role: {
    type: String,
    required: true,
    enum: ['student', 'teacher', 'hr', 'md'],
  },
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
