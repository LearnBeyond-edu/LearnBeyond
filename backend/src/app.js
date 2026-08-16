const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const xss = require('xss-clean');
const { v4: uuidv4 } = require('uuid');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const rateLimit = require('express-rate-limit');

// Import routes
const routes = require('./routes');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(xss());
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:4005',
].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl / Postman) and our allowed list
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// In-memory Rate limiting (no Redis required for local dev)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Correlation ID Middleware
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// Parse JSON payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// HTTP Request Logging with Correlation ID
morgan.token('reqId', (req) => req.id);
app.use(morgan(':remote-addr - :reqId [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms', { 
  stream: { write: message => logger.info(message.trim()) } 
}));

// Static directory for file uploads
app.use('/uploads', express.static('uploads'));

// Health and Readiness Endpoints
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.get('/readyz', async (req, res) => {
  try {
    const { pool } = require('./config/db');
    await pool.query('SELECT 1');
    res.status(200).send('OK');
  } catch (err) {
    logger.error(`Readiness check failed: ${err.message}`);
    res.status(503).send('Service Unavailable');
  }
});

// Mount domain routes here
app.use('/api', routes);

// Catch 404
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Not Found - ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
