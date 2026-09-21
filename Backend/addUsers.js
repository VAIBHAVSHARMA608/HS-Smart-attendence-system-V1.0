require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hssmart';

const users = [
  { username: 'student123', password: 'password', role: 'student' },
  { username: 'teacher01', password: 'teach@123', role: 'teacher' },
  { username: 'hradmin', password: 'hr@123', role: 'hr' },
  { username: 'mdmaster', password: 'md@2024', role: 'md' },
];

async function seed() {
  await mongoose.connect(uri);
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    await User.findOneAndUpdate(
      { username: u.username, role: u.role },
      { username: u.username, password: hashed, role: u.role },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Seeded ${u.username} (${u.role})`);
  }
  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
