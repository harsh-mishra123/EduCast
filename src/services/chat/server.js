require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');

const config = require('../../shared/config/env');
const { logger } = require('../../shared/utils/logger');
const { connectRedis } = require('../../shared/utils/redis');
const { connectRabbitMQ } = require('../../shared/utils/rabbitmq');
const connectDB = require('./config/database');
const chatRoutes = require('./routes/chat.routes');
const { initWebSocket } = require('./websocket/server');

const app = express();
const server = http.createServer(app);
const PORT = config.CHAT_PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'chat', timestamp: new Date().toISOString() });
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
    
    initWebSocket(server);
    
    server.listen(PORT, () => {
      logger.info(`Chat service running on port ${PORT}`);
      logger.info(`WebSocket ready for connections`);
    });
  } catch (error) {
    logger.error('Failed to start chat service:', error);
    process.exit(1);
  }
}

start();

module.exports = { app, server };