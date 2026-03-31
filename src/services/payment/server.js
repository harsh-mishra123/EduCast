require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const config = require('../../shared/config/env');
const { logger } = require('../../shared/utils/logger');
const { connectRedis } = require('../../shared/utils/redis');
const { connectRabbitMQ } = require('../../shared/utils/rabbitmq');
const { initStripe } = require('./config/stripe');
const connectDB = require('./config/database');
const paymentRoutes = require('./routes/payment.routes');
const webhookRoutes = require('./routes/webhook.routes');
const { startConsumers } = require('./queues/consumer');

const app = express();
const PORT = config.PAYMENT_PORT;

app.use(helmet());
app.use(cors());

// Webhook route needs raw body
app.use('/api/payment/webhook', webhookRoutes);

// Regular routes
app.use(express.json());
app.use('/api/payment', paymentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payment', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

async function start() {
  try {
    await connectDB();
    await connectRedis();
    await connectRabbitMQ();
    initStripe();
    await startConsumers();
    
    app.listen(PORT, () => {
      logger.info(`Payment service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start payment service:', error);
    process.exit(1);
  }
}

start();

module.exports = app;