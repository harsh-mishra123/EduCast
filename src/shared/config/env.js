require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  AUTH_PORT: parseInt(process.env.AUTH_PORT) || 3001,
  CLASS_PORT: parseInt(process.env.CLASS_PORT) || 3002,
  PAYMENT_PORT: parseInt(process.env.PAYMENT_PORT) || 3003,
  VIDEO_PORT: parseInt(process.env.VIDEO_PORT) || 3004,
  CHAT_PORT: parseInt(process.env.CHAT_PORT) || 3005,
  NOTIFICATION_PORT: parseInt(process.env.NOTIFICATION_PORT) || 3006,
  GATEWAY_PORT: parseInt(process.env.GATEWAY_PORT) || 8000,
  
  MONGO_AUTH_URI: process.env.MONGO_AUTH_URI || 'mongodb://localhost:27017/classcast_auth',
  MONGO_CLASS_URI: process.env.MONGO_CLASS_URI || 'mongodb://localhost:27017/classcast_class',
  MONGO_PAYMENT_URI: process.env.MONGO_PAYMENT_URI || 'mongodb://localhost:27017/classcast_payment',
  MONGO_VIDEO_URI: process.env.MONGO_VIDEO_URI || 'mongodb://localhost:27017/classcast_video',
  MONGO_CHAT_URI: process.env.MONGO_CHAT_URI || 'mongodb://localhost:27017/classcast_chat',
  MONGO_NOTIFICATION_URI: process.env.MONGO_NOTIFICATION_URI || 'mongodb://localhost:27017/classcast_notification',
  
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'localhost:9000',
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY || 'minioadmin',
  MINIO_BUCKET: process.env.MINIO_BUCKET || 'classcast-videos',
  
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-me',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
};
