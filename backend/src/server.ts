import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

const startServer = async () => {
  // Initialize Database Connection
  await connectDB();

  // Bind and listen port
  app.listen(env.PORT, () => {
    console.log(`[INFO] Express Backend is running on http://localhost:${env.PORT}`);
    console.log(`[INFO] Health check available at http://localhost:${env.PORT}/api/health`);
  });
};

// Handle process-wide crashes cleanly
process.on('uncaughtException', (error) => {
  console.error('[CRITICAL] Uncaught exception occurred:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[CRITICAL] Unhandled promise rejection:', reason);
  process.exit(1);
});

startServer();
