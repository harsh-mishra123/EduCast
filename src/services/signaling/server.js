require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');

const config = require('../../shared/config/env');
const { logger } = require('../../shared/utils/logger');
const { connectRedis } = require('../../shared/utils/redis');
const { connectRabbitMQ } = require('../../shared/utils/rabbitmq');
const WebSocketServer = require('./websocket/server');
const { startConsumers } = require('./queues/consumer');

const app = express();
const server = http.createServer(app);
const PORT = config.SIGNALING_PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'signaling', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

async function start() {
  try {
    await connectRedis();
    await connectRabbitMQ();
    await startConsumers();
    
    new WebSocketServer(server);
    
    server.listen(PORT, () => {
      logger.info(`Signaling service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start signaling service:', error);
    process.exit(1);
  }
}

start();

module.exports = { app, server };