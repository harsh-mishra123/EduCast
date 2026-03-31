const { consumeQueue, QUEUES } = require('../../../shared/utils/rabbitmq');
const { logger } = require('../../../shared/utils/logger');

async function startConsumers() {
  await consumeQueue(QUEUES.LIVE_STARTED, async (message) => {
    logger.info('Live started event received:', message.lectureId);
    // Notify all waiting participants
  });
  
  await consumeQueue(QUEUES.LIVE_ENDED, async (message) => {
    logger.info('Live ended event received:', message.lectureId);
    // Close all connections for this lecture
  });
  
  logger.info('Signaling service consumers started');
}

module.exports = { startConsumers };