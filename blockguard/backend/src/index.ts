import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import auditRoutes from './routes/audit';
import { logger } from './services/logger';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Security Middleware: Helmet with strict No-Referrer Policy
app.use(helmet({
  referrerPolicy: { policy: 'no-referrer' },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Access Logging Middleware (Sanitizes URLs by stripping query strings to prevent secret leakage)
app.use((req, res, next) => {
  const start = Date.now();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  // Strip any query parameters from logs to prevent URL-based credential leakage
  const sanitizedPath = (req.originalUrl || req.url || '').split('?')[0];

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logAccess(ip, req.method, sanitizedPath, res.statusCode, duration);
  });

  next();
});

// Rate limiting: 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use(limiter);

app.use(express.json({ limit: '2mb' }));

// Health Check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'BlockGuard Scanner Backend',
    database: 'SQLite (Persistent data/blockguard.db)',
    logging: 'Active (logs/access.log & logs/security.log)',
    timestamp: new Date().toISOString(),
    network: 'Avalanche Fuji (43113)'
  });
});

// Mount Routes
app.use('/api', auditRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🛡️  BlockGuard Backend Scanner running on port ${PORT}`);
  console.log(`💾 Database: SQLite (Persistent in data/blockguard.db)`);
  console.log(`📝 Audit Logs: logs/access.log & logs/security.log`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`===============================================`);
});

export default app;
