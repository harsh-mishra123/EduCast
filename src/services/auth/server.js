require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { logger } = require('../../shared/utils/logger');
const { connectRedis } = require('../../shared/utils/redis');
const { connectRabbitMQ } = require('../../shared/utils/rabbitmq');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.AUTH_PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const start = async () => {
  try {
    await connectDB();
    await connectRedis();
    await connectRabbitMQ();
    
    app.listen(PORT, () => {
      logger.info(`Auth service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start auth service:', error);
    process.exit(1);
  }
};

start();