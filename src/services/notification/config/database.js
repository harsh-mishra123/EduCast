const mongoose = require('mongoose');
const config = require('../../../shared/config/env');
const { logger } = require('../../../shared/utils/logger');

async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_NOTIFICATION_URI);
    logger.info('Notification Service: MongoDB connected to classcast_notification');
  } catch (error) {
    logger.error('Notification Service: MongoDB connection error:', error);
    process.exit(1);
  }
}

module.exports = connectDB;