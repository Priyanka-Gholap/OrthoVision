import dotenv from 'dotenv';
import path from 'path';

// Load environmental configuration (.env)
// Try loading from backend folder first, fallback to root folder if not found
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  AI_SERVICE_KEY: process.env.AI_SERVICE_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Validate that required variables are loaded
const validateEnv = () => {
  const missingVars: string[] = [];

  if (!env.MONGO_URI) missingVars.push('MONGO_URI');
  if (!env.JWT_SECRET) missingVars.push('JWT_SECRET');
  if (!env.AI_SERVICE_KEY) missingVars.push('AI_SERVICE_KEY');

  if (missingVars.length > 0) {
    console.error(`[ERROR] Missing required environment variables: ${missingVars.join(', ')}`);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

validateEnv();
