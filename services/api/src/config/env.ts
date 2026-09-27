import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'easyride_jwt_secret_key_super_secure_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'easyride_jwt_refresh_secret_key_2026',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || '',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/easyride_db',
  USE_POSTGRES_DB: process.env.USE_POSTGRES_DB === 'true',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  USE_REDIS: process.env.USE_REDIS === 'true',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8001',
  DISPATCH_ENGINE_URL: process.env.DISPATCH_ENGINE_URL || 'http://localhost:8002',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_easyride_mock_12345',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_easyride_mock_67890',
};
