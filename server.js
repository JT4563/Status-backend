require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { connectDb } = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const { errorHandler, notFound } = require('./src/middleware/error');
const rateLimiters = require('./src/middleware/rateLimiters');

const authRoutes = require('./src/routes/auth.routes');
const usersRoutes = require('./src/routes/users.routes');
const mapRoutes = require('./src/routes/map.routes');
const alertsRoutes = require('./src/routes/alerts.routes');
const aiRoutes = require('./src/routes/ai.routes');
const actionsRoutes = require('./src/routes/actions.routes');
const reportsRoutes = require('./src/routes/reports.routes');
const healthRoutes = require('./src/routes/health.routes');
const cctvRoutes = require('./src/routes/cctv.routes');
const pingsRoutes = require('./src/routes/pings.routes');

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(compression());
app.use(morgan('tiny'));

// Rate limiters
app.use('/api/v1/auth/login', rateLimiters.loginLimiter);
app.use('/api/v1/reports', rateLimiters.reportsLimiter);
app.use('/api/v1/actions', rateLimiters.actionsLimiter);

// Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/map-data', mapRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1', aiRoutes); // exposes /api/v1/ai-insights & /api/v1/ai-predictions
app.use('/api/v1/actions', actionsRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/system-health', healthRoutes);
app.use('/api/v1/cctv', cctvRoutes);
app.use('/api/v1/pings', pingsRoutes);

// Legacy aliases for current frontend (optional)
app.use('/api/auth', authRoutes);
app.use('/api/map-data', mapRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api', aiRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/system-health', healthRoutes);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

// Start DB then server+socket
const PORT = process.env.PORT || 8080;
connectDb().then(() => {
  const ioApi = initSocket(server);
  app.set('ioApi', ioApi);
  server.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect DB', err);
  process.exit(1);
});
