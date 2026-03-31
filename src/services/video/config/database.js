const mongoose = require('mongoose');
const config = require('../../../shared/config/env');
const { logger } = require('../../../shared/utils/logger');

async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_VIDEO_URI || 'mongodb://localhost:27017/classcast_video');
    logger.info('Video Service: MongoDB connected to classcast_video');
  } catch (error) {
    logger.error('Video Service: MongoDB connection error:', error);
    process.exit(1);
  }
}

module.exports = connectDB;
