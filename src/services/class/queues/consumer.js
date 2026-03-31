const { consumeQueue, QUEUES, ackMessage } = require('../../../shared/utils/rabbitmq');
const enrollmentService = require('../services/enrollment.service');
const { logger } = require('../../../shared/utils/logger');

async function startConsumers() {
  await consumeQueue(QUEUES.PAYMENT_COMPLETED, async (message) => {
    logger.info('Processing payment completed event:', message);
    
    const { userId, courseId, lectureId, amount, paymentId } = message;
    
    try {
      if (courseId) {
        await enrollmentService.enrollInCourse(userId, courseId, amount, paymentId);
      } else if (lectureId) {
        await enrollmentService.enrollInLecture(userId, lectureId, amount, paymentId);
      }
    } catch (error) {
      logger.error('Error processing enrollment:', error);
      throw error;
    }
  });
  
  logger.info('Class service consumers started');
}

module.exports = { startConsumers };