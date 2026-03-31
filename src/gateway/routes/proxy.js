const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../../shared/config/env');

const authProxy = createProxyMiddleware({
  target: `http://localhost:${config.AUTH_PORT}`,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/api/auth' }
});

const classProxy = createProxyMiddleware({
  target: `http://localhost:${config.CLASS_PORT}`,
  changeOrigin: true,
  pathRewrite: { '^/api/class': '/api/class' }
});

const paymentProxy = createProxyMiddleware({
  target: `http://localhost:${config.PAYMENT_PORT}`,
  changeOrigin: true,
  pathRewrite: { '^/api/payment': '/api/payment' }
});

const videoProxy = createProxyMiddleware({
  target: `http://localhost:${config.VIDEO_PORT}`,
  changeOrigin: true,
  pathRewrite: { '^/api/video': '/api/video' }
});

const chatProxy = createProxyMiddleware({
  target: `http://localhost:${config.CHAT_PORT}`,
  changeOrigin: true,
  pathRewrite: { '^/api/chat': '/api/chat' }
});

const notificationProxy = createProxyMiddleware({
  target: `http://localhost:${config.NOTIFICATION_PORT}`,
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '/api/notifications' }
});

module.exports = {
  authProxy,
  classProxy,
  paymentProxy,
  videoProxy,
  chatProxy,
  notificationProxy
};