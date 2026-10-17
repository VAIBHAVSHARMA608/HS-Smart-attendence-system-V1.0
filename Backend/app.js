const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Doesn't touch the database — confirms the deployment itself is up,
// independent of the MongoDB connection.
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Connect lazily per request; connectDB() reuses the cached connection on
// warm serverless invocations, so this stays cheap.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/salary', require('./routes/salary'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/dashboard', require('./routes/dashboard'));

module.exports = app;
