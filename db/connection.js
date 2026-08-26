import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Fix Node.js DNS SRV lookup issues on Windows / certain ISPs for mongodb+srv URIs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if setting DNS servers fails in specific environments
}

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return true;
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lokvani_ai';

  try {
    // Attempt Mongoose connection with 3-second timeout
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully to ${mongoURI}`);
    return true;
  } catch (err) {
    console.warn(`[MongoDB] Warning: Could not connect to MongoDB at ${mongoURI}. Operating in resilient In-Memory Fallback mode. (${err.message})`);
    isConnected = false;
    return false;
  }
}

export function isMongoDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
