import mongoose from 'mongoose';
import { env } from './env';

const RETRY_LIMIT = 5;
const RETRY_INTERVAL_MS = 5000;

export const connectDB = async (): Promise<void> => {
  if (!env.MONGO_URI) {
    console.warn('[WARN] No MONGO_URI provided. MongoDB connection skipped.');
    return;
  }

  let attempts = 0;

  const attemptConnect = async () => {
    try {
      attempts++;
      console.log(`[INFO] Connecting to MongoDB Atlas (Attempt ${attempts}/${RETRY_LIMIT})...`);
      
      await mongoose.connect(env.MONGO_URI, {
        autoIndex: true, // Build indexes in dev
      });

      console.log('[INFO] MongoDB Atlas connected successfully.');
    } catch (error) {
      console.error(`[ERROR] MongoDB connection failure:`, error);
      
      if (attempts < RETRY_LIMIT) {
        console.log(`[INFO] Retrying connection in ${RETRY_INTERVAL_MS / 1000} seconds...`);
        setTimeout(attemptConnect, RETRY_INTERVAL_MS);
      } else {
        console.error('[CRITICAL] MongoDB connection attempts exhausted. Exiting process.');
        if (env.NODE_ENV === 'production') {
          process.exit(1);
        }
      }
    }
  };

  await attemptConnect();
};

// Handle connection anomalies post-initialization
mongoose.connection.on('error', (err) => {
  console.error(`[ERROR] MongoDB connection lost or compromised: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[WARN] MongoDB disconnected.');
});
