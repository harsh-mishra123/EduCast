require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const config = require('../../shared/config/env');
const { logger } = require('../../shared/utils/logger');
const { connectRabbitMQ } = require('../../shared/utils/rabbitmq');
const connectDB = require('./config/database');
const courseRoutes = require('./routes/course.routes');
const lectureRoutes = require('./routes/lecture.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');

const app = express();
const PORT = config.CLASS_PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/class/courses', courseRoutes);
app.use('/api/class/lectures', lectureRoutes);
app.use('/api/class/enrollments', enrollmentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'class', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

async function start() {
  try {
    await connectDB();
    await connectRabbitMQ();
    
    app.listen(PORT, () => {
      logger.info(`Class service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start class service:', error);
    process.exit(1);
  }
}

start();

module.exports = app;