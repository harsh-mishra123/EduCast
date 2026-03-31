const mongoose = require('mongoose');
const config = require('../../../shared/config/env');
const { logger } = require('../../../shared/utils/logger');

async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_CLASS_URI);
    logger.info('Class Service: MongoDB connected to classcast_class');
  } catch (error) {
    logger.error('Class Service: MongoDB connection error:', error);
    process.exit(1);
  }
}

module.exports = connectDB;