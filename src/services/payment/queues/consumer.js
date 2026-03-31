const { consumeQueue, QUEUES, ackMessage } = require('../../../shared/utils/rabbitmq');
const paymentService = require('../services/payment.service');
const stripeService = require('../services/stripe.service');
const splitService = require('../services/split.service');
const { logger } = require('../../../shared/utils/logger');

async function startConsumers() {
  // Handle payout requests
  await consumeQueue(QUEUES.PAYOUT_READY, async (message) => {
    logger.info('Processing payout:', message);
    
    try {
      const { educatorId, payoutId, amount, stripePayoutId } = message;
      
      // Update payout status
      const payout = await paymentService.updatePayoutStatus(payoutId, 'paid');
      
      logger.info(`Payout completed: ${payoutId}`);
    } catch (error) {
      logger.error('Payout processing error:', error);
      throw error;
    }
  });
  
  logger.info('Payment service consumers started');
}

module.exports = { startConsumers };