require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const config = require('../../shared/config/env');
const { logger } = require('../../shared/utils/logger');
const { connectRabbitMQ } = require('../../shared/utils/rabbitmq');
const { initMinio, ensureBucket } = require('../../video/config/minio');
const { startConsumers } = require('./queues/consumer');
const uploadService = require('./services/upload.service');

const app = express();
const PORT = config.RECORDING_PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'recording', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

async function start() {
  try {
    await connectRabbitMQ();
    initMinio();
    await uploadService.initialize();
    await startConsumers();
    
    app.listen(PORT, () => {
      logger.info(`Recording service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start recording service:', error);
    process.exit(1);
  }
}

start();

module.exports = app;