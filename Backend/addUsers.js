const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/hssmart', { useNewUrlParser: true, useUnifiedTopology: true });

const users = [
  { username: 'student123', password: 'password', role: 'student' },
  { username: 'teacher01', password: 'teach@123', role: 'teacher' },
  { username: 'hradmin', password: 'hr@123', role: 'hr' },
  { username: 'mdmaster', password: 'md@2024', role: 'md' }
];

User.insertMany(users).then(() => {
  console.log('Sample users added');
  mongoose.disconnect();
});