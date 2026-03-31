require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');

const config = require('../shared/config/env');
const { logger } = require('../shared/utils/logger');
const { limiter } = require('../shared/middleware/rateLimiter');

const app = express();
const PORT = config.GATEWAY_PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'gateway',
    timestamp: new Date().toISOString(),
    services: {
      auth: `http://localhost:${config.AUTH_PORT}/health`,
      class: `http://localhost:${config.CLASS_PORT}/health`,
      payment: `http://localhost:${config.PAYMENT_PORT}/health`,
      video: `http://localhost:${config.VIDEO_PORT}/health`,
      chat: `http://localhost:${config.CHAT_PORT}/health`,
      notification: `http://localhost:${config.NOTIFICATION_PORT}/health`,
      media: `http://localhost:${config.MEDIA_PORT}/health`,
      signaling: `http://localhost:${config.SIGNALING_PORT}/health`,
      recording: `http://localhost:${config.RECORDING_PORT}/health`
    }
  });
});

// Proxy routes
app.use('/api/auth', createProxyMiddleware({
  target: `http://localhost:${config.AUTH_PORT}`,
  changeOrigin: true
}));

app.use('/api/class', createProxyMiddleware({
  target: `http://localhost:${config.CLASS_PORT}`,
  changeOrigin: true
}));

app.use('/api/payment', createProxyMiddleware({
  target: `http://localhost:${config.PAYMENT_PORT}`,
  changeOrigin: true
}));

app.use('/api/video', createProxyMiddleware({
  target: `http://localhost:${config.VIDEO_PORT}`,
  changeOrigin: true
}));

app.use('/api/chat', createProxyMiddleware({
  target: `http://localhost:${config.CHAT_PORT}`,
  changeOrigin: true
}));

app.use('/api/notifications', createProxyMiddleware({
  target: `http://localhost:${config.NOTIFICATION_PORT}`,
  changeOrigin: true
}));

// WebSocket upgrade handling for chat
app.use('/ws/chat', createProxyMiddleware({
  target: `ws://localhost:${config.CHAT_PORT}`,
  ws: true,
  changeOrigin: true
}));

// WebSocket for signaling
app.use('/ws/signaling', createProxyMiddleware({
  target: `ws://localhost:${config.SIGNALING_PORT}`,
  ws: true,
  changeOrigin: true
}));

// WebSocket for media
app.use('/ws/media', createProxyMiddleware({
  target: `ws://localhost:${config.MEDIA_PORT}`,
  ws: true,
  changeOrigin: true
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(`Routes:`);
  logger.info(`  /api/auth/* -> Auth Service (${config.AUTH_PORT})`);
  logger.info(`  /api/class/* -> Class Service (${config.CLASS_PORT})`);
  logger.info(`  /api/payment/* -> Payment Service (${config.PAYMENT_PORT})`);
  logger.info(`  /api/video/* -> Video Service (${config.VIDEO_PORT})`);
  logger.info(`  /api/chat/* -> Chat Service (${config.CHAT_PORT})`);
  logger.info(`  /api/notifications/* -> Notification Service (${config.NOTIFICATION_PORT})`);
  logger.info(`  /ws/* -> WebSocket Services`);
});

module.exports = app;