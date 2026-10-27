const mongoose = require('mongoose');
const dns = require('dns');

// Fix SRV DNS resolution issues on Windows with Node.js
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if custom dns is not allowed in environment
}

let isConnected = false;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const fallbackUri =
    process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/hackathon_db';

  if (!primaryUri && !fallbackUri) {
    console.warn('⚠️ No MongoDB URI configured.');
    return;
  }

  // Attempt 1: Try Primary MongoDB URI (e.g. Atlas)
  if (primaryUri) {
    try {
      console.log('🔄 Connecting to primary MongoDB...');
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      try {
        const { seedInitialData } = require('./seeder');
        await seedInitialData();
      } catch (seedErr) {
        console.warn('⚠️ Seeder notice:', seedErr.message);
      }
      return;
    } catch (error) {
      console.warn(`⚠️ Primary MongoDB Connection Failed: ${error.message}`);
    }
  }

  // Attempt 2: Fallback to Local MongoDB
  if (fallbackUri && fallbackUri !== primaryUri) {
    try {
      console.log(`🔄 Attempting fallback to local MongoDB (${fallbackUri})...`);
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 3000,
      });
      isConnected = true;
      console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);

      try {
        const { seedInitialData } = require('./seeder');
        await seedInitialData();
      } catch (seedErr) {
        console.warn('⚠️ Seeder notice:', seedErr.message);
      }
    } catch (localError) {
      isConnected = false;
      console.error(`❌ MongoDB Connection Error: ${localError.message}`);
      console.warn('💡 Tip: For Atlas, whitelist your IP (0.0.0.0/0) or ensure local MongoDB is running.');
    }
  }
};

const getDBStatus = () => {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || 'none',
    stateName: ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'][mongoose.connection.readyState] || 'Unknown',
  };
};

module.exports = { connectDB, getDBStatus };
