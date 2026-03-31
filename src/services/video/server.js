require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const config = require('../../shared/config/env');
const { logger } = require('../../shared/utils/logger');
const { connectRedis } = require('../../shared/utils/redis');
const { connectRabbitMQ } = require('../../shared/utils/rabbitmq');
const { initMinio } = require('./config/minio');
const connectDB = require('./config/database');
const videoRoutes = require('./routes/video.routes');
const uploadService = require('./services/upload.service');

const app = express();
const PORT = config.VIDEO_PORT || 3004;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/video', videoRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'video', timestamp: new Date().toISOString() });
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
    initMinio();
    await uploadService.initialize();
    
    app.listen(PORT, () => {
      logger.info(`Video service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start video service:', error);
    process.exit(1);
  }
}

start();

module.exports = app;
