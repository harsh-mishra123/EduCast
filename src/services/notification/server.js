require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const config = require('../../shared/config/env');
const { logger } = require('../../shared/utils/logger');
const { connectRabbitMQ } = require('../../shared/utils/rabbitmq');
const connectDB = require('./config/database');
const notificationRoutes = require('./routes/notification.routes');
const { startConsumers } = require('./queues/consumer');

const app = express();
const PORT = config.NOTIFICATION_PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

async function start() {
  try {
    await connectDB();
    await connectRabbitMQ();
    await startConsumers();
    
    app.listen(PORT, () => {
      logger.info(`Notification service running on port ${PORT}`);
      logger.info('Consumers started for: welcome, reminder, live-started, payment, certificate');
    });
  } catch (error) {
    logger.error('Failed to start notification service:', error);
    process.exit(1);
  }
}

start();

module.exports = app;