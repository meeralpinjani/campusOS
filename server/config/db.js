const mongoose = require('mongoose');

/**
 * Connects to MongoDB database using Mongoose ODM.
 * Handles connection lifecycle events and provides helpful debugging logs.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kitcommunity', {
      // Modern mongoose options are enabled by default in v6+
    });

    console.log(`[MongoDB Connected] Host: ${conn.connection.host} | DB Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    console.error(`Tip: Ensure MongoDB service is running locally on port 27017 or update MONGO_URI in .env`);
    // Exit process with failure code if unable to connect
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Warning] Lost connection to MongoDB database.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB Restored] Reconnected to MongoDB database.');
});

module.exports = connectDB;
