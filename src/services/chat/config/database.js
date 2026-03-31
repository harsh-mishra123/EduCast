const mongoose = require('mongoose');
const config = require('../../../shared/config/env');
const { logger } = require('../../../shared/utils/logger');

async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_CHAT_URI);
    logger.info('Chat Service: MongoDB connected to classcast_chat');
  } catch (error) {
    logger.error('Chat Service: MongoDB connection error:', error);
    process.exit(1);
  }
}

module.exports = connectDB;