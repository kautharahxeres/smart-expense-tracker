require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const winston = require('winston');

const app = express();
const prisma = new PrismaClient();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Set it in .env or your deployment environment.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is not set. Production may fail without DB connection.');
}

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Middleware
app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((u) => u.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const msg = `CORS policy: origin ${origin} not allowed`;
    return callback(new Error(msg), false);
  },
  credentials: true,
}));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/expenses', require('./src/routes/expenses'));
app.use('/api/budgets', require('./src/routes/budgets'));
app.use('/api/users', require('./src/routes/users'));

// Error handling middleware
app.use(require('./src/middleware/errorHandler'));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

const shutdown = async (signal) => {
  try {
    logger.info(`Shutdown signal received (${signal}). Closing server and database connections.`);
    server.close(async (err) => {
      if (err) {
        logger.error('Server close error', err);
        process.exit(1);
      }
      await prisma.$disconnect();
      logger.info('Database connection closed');
      process.exit(0);
    });
  } catch (err) {
    logger.error('Shutdown error', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', async (err) => {
  logger.error('Uncaught exception', err);
  await shutdown('uncaughtException');
});
process.on('unhandledRejection', async (reason) => {
  logger.error('Unhandled rejection', reason);
  await shutdown('unhandledRejection');
});

module.exports = app;