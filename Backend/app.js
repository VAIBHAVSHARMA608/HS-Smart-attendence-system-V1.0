const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));
app.get('/', (req, res) => res.redirect('/Frontend/login%20page.html'));

// Doesn't touch the database — useful for confirming the deployment itself
// is up, independent of the MongoDB connection.
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Connect lazily on each request instead of at module load time. On Vercel,
// connectDB() reuses the cached connection on warm invocations, so this
// stays cheap — it just guarantees a connection exists before any route
// touches the database, on cold starts too.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/users', require('./routes/addusers'));

module.exports = app;
