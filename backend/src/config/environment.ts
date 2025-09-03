import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('8000'),
  
  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default('5432'),
  DB_NAME: z.string().default('resume_analyser'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  
  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRE: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRE: z.string().default('7d'),
  
  // AI Services
  GEMINI_API_KEY: z.string().optional(),
  
  // Email
  EMAIL_HOST: z.string().default('smtp.gmail.com'),
  EMAIL_PORT: z.string().transform(Number).default('587'),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'), // 10MB
  UPLOAD_DIR: z.string().default('uploads'),
  
  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  SESSION_SECRET: z.string().min(32),
  
  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
});

// Validate environment variables
const env = envSchema.parse(process.env);

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  
  database: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    url: env.DATABASE_URL,
  },
  
  redis: {
    url: env.REDIS_URL,
  },
  
  jwt: {
    secret: env.JWT_SECRET,
    expire: env.JWT_EXPIRE,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpire: env.JWT_REFRESH_EXPIRE,
  },
  
  ai: {
    geminiApiKey: env.GEMINI_API_KEY,
  },
  
  email: {
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    directory: env.UPLOAD_DIR,
  },
  
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    sessionSecret: env.SESSION_SECRET,
  },
  
  cors: {
    allowedOrigins: env.ALLOWED_ORIGINS.split(',').map((origin: string) => origin.trim()),
  },
  
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
} as const;
