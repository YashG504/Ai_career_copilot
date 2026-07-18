import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppError } from './utils/AppError';

// Route imports
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import resumeRoutes from './routes/resumeRoutes';
import jobMatchRoutes from './routes/jobMatchRoutes';
import interviewRoutes from './routes/interviewRoutes';
import skillGapRoutes from './routes/skillGapRoutes';
import learningRoutes from './routes/learningRoutes';
import jobApplicationRoutes from './routes/jobApplicationRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import coverLetterRoutes from './routes/coverLetterRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ────────────────────────────────────────────────────────

// Helmet sets secure HTTP headers (HSTS, X-Frame-Options, CSP, etc.)
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// ─── Rate Limiting ──────────────────────────────────────────────────────────────

// General rate limit: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Auth rate limit: 10 requests per 15 minutes per IP (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

// AI rate limit: 20 requests per 15 minutes per IP (prevent API credit abuse)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI rate limit exceeded, please try again later.' },
});

// ─── Database Connection ────────────────────────────────────────────────────────

const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
} else {
  console.warn('⚠️  MONGO_URI is not defined. Skipping database connection.');
}

// ─── API Routes ─────────────────────────────────────────────────────────────────

// Auth routes (stricter rate limit)
app.use('/api/auth', authLimiter, authRoutes);

// AI-powered routes (AI rate limit to prevent credit abuse)
app.use('/api/resume', aiLimiter, resumeRoutes);
app.use('/api/jobmatch', aiLimiter, jobMatchRoutes);
app.use('/api/interview', aiLimiter, interviewRoutes);
app.use('/api/skillgap', aiLimiter, skillGapRoutes);
app.use('/api/learning', aiLimiter, learningRoutes);
app.use('/api/portfolio', aiLimiter, portfolioRoutes);
app.use('/api/coverletter', aiLimiter, coverLetterRoutes);

// Standard routes (general rate limit)
app.use('/api/profile', generalLimiter, profileRoutes);
app.use('/api/jobs', generalLimiter, jobApplicationRoutes);
app.use('/api/analytics', generalLimiter, analyticsRoutes);
app.use('/api/notifications', generalLimiter, notificationRoutes);
app.use('/api/admin', generalLimiter, adminRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'AI Career Copilot API is running 🚀' });
});

// ─── Global Error Handler ───────────────────────────────────────────────────────

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  // Handle Multer file upload errors
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Handle known operational errors (AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle Mongoose validation errors
  if (err?.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Handle Mongoose duplicate key errors
  if (err?.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate field value entered' });
  }

  // Handle Mongoose cast errors (invalid ObjectId, etc.)
  if (err?.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  // Unknown/unexpected errors
  console.error('Unhandled error:', err);

  // In production, don't leak error details
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err?.message || 'Server error';

  return res.status(err?.statusCode || 500).json({ success: false, message });
});

// ─── Start Server & Graceful Shutdown ───────────────────────────────────────────

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Graceful shutdown: close HTTP server and DB connection on termination
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed.');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }
    process.exit(0);
  });

  // Force shutdown after 10 seconds if graceful fails
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
