import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';
import { database } from '@/config/database';

// Route imports
import authRoutes from '@/routes/auth.routes';
import userRoutes from '@/routes/user.routes';
import jobRoutes from '@/routes/job.routes';
import resumeRoutes from '@/routes/resume.routes';
import aiRoutes from '@/routes/ai.routes';
import analyticsRoutes from '@/routes/analytics.routes';
import interviewRoutes from '@/routes/interview.routes';

class Server {
  private app: express.Application;
  private httpServer: any;
  private io: Server;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new Server(this.httpServer, {
      cors: {
        origin: config.cors.allowedOrigins,
        methods: ['GET', 'POST'],
      },
    });

    this.initializeDatabase();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeSocketIO();
    this.initializeErrorHandling();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await database.raw('SELECT 1');
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed:', error);
      process.exit(1);
    }
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: config.cors.allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Body parsing and compression
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger);

    // Static files
    this.app.use('/uploads', express.static('uploads'));
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/jobs', jobRoutes);
    this.app.use('/api/resumes', resumeRoutes);
    this.app.use('/api/ai', aiRoutes);
    this.app.use('/api/analytics', analyticsRoutes);
    this.app.use('/api/interviews', interviewRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl 
      });
    });
  }

  private initializeSocketIO(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('join-interview-room', (interviewId: string) => {
        socket.join(`interview-${interviewId}`);
        logger.info(`Client ${socket.id} joined interview room ${interviewId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });

    // Make io available to routes
    this.app.set('io', this.io);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(): void {
    const port = config.port;
    
    this.httpServer.listen(port, () => {
      logger.info(`🚀 Server running on port ${port} in ${config.nodeEnv} mode`);
      logger.info(`📝 API Documentation: http://localhost:${port}/api/docs`);
      logger.info(`🔗 Health Check: http://localhost:${port}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));
  }

  private async gracefulShutdown(): Promise<void> {
    logger.info('Received shutdown signal, closing server gracefully...');
    
    this.httpServer.close(() => {
      logger.info('HTTP server closed');
      
      database.destroy().then(() => {
        logger.info('Database connection closed');
        process.exit(0);
      });
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  }
}

const server = new Server();
server.start();

export default server;
