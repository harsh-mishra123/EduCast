const mongoose = require('mongoose');
const config = require('../../../shared/config/env');
const { logger } = require('../../../shared/utils/logger');

async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_PAYMENT_URI);
    logger.info('Payment Service: MongoDB connected to classcast_payment');
  } catch (error) {
    logger.error('Payment Service: MongoDB connection error:', error);
    process.exit(1);
  }
}

module.exports = connectDB;