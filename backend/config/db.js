const mongoose = require('mongoose');

// Retry connection — important for Docker where mongo may not be ready instantly
const MAX_RETRIES   = 5;
const RETRY_DELAY_MS = 5000; // 5 seconds between retries

const connectDB = async (attempt = 1) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection attempt ${attempt} failed: ${error.message}`);

    if (attempt < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s... (${attempt}/${MAX_RETRIES})`);
      setTimeout(() => connectDB(attempt + 1), RETRY_DELAY_MS);
    } else {
      console.error('Max MongoDB connection retries reached. Exiting.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
