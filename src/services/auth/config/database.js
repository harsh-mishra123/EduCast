const mongoose = require('mongoose');
const config = require('../../../shared/config/env');
const { logger } = require('../../../shared/utils/logger');

async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_AUTH_URI || 'mongodb://localhost:27017/classcast_auth');
    logger.info('Auth Service: MongoDB connected to classcast_auth');
  } catch (error) {
    logger.error('Auth Service: MongoDB connection error:', error);
    process.exit(1);
  }
}

module.exports = connectDB;
