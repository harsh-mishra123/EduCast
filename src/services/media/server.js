require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');

const config = require('../../shared/config/env');
const { logger } = require('../../shared/utils/logger');
const { connectRedis } = require('../../shared/utils/redis');
const { initWorker } = require('./mediasoup/worker');
const { initRouter } = require('./mediasoup/router');
const SignalingServer = require('./signaling/websocket');

const app = express();
const server = http.createServer(app);
const PORT = config.MEDIA_PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'media', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

async function start() {
  try {
    await connectRedis();
    await initWorker();
    await initRouter();
    
    new SignalingServer(server);
    
    server.listen(PORT, () => {
      logger.info(`Media service running on port ${PORT}`);
      logger.info(`WebRTC ports: 10000-10100 UDP`);
    });
  } catch (error) {
    logger.error('Failed to start media service:', error);
    process.exit(1);
  }
}

start();

module.exports = { app, server };