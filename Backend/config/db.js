const mongoose = require('mongoose');

// In serverless environments (Vercel) a new function invocation can reuse a
// "warm" container. Caching the connection on the global object means we
// reconnect only when truly needed, instead of opening a fresh MongoDB
// connection on every request — which is what would otherwise burn through
// your MongoDB Atlas free-tier connection limit and Vercel execution time.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hssmart';

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        maxPoolSize: 5, // keep well under Atlas free-tier connection caps
      })
      .then((mongooseInstance) => {
        console.log('MongoDB connected');
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error('MongoDB connection error:', err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
