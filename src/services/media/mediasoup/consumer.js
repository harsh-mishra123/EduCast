const { getRouterInstance } = require('./router');
const { logger } = require('../../../shared/utils/logger');

async function createConsumer(transportId, producerId, rtpCapabilities) {
  const router = getRouterInstance();
  const transport = router._getTransport(transportId);
  
  if (!transport) {
    throw new Error('Transport not found');
  }
  
  const producer = router._getProducer(producerId);
  if (!producer) {
    throw new Error('Producer not found');
  }
  
  if (!router.canConsume({ producerId, rtpCapabilities })) {
    throw new Error('Cannot consume');
  }
  
  const consumer = await transport.consume({
    producerId,
    rtpCapabilities,
    paused: false
  });
  
  logger.info(`Consumer created: ${consumer.id} for producer ${producerId}`);
  return consumer;
}

async function closeConsumer(consumerId) {
  const router = getRouterInstance();
  for (const transport of router._transports.values()) {
    const consumer = transport._consumers.get(consumerId);
    if (consumer) {
      await consumer.close();
      logger.info(`Consumer closed: ${consumerId}`);
      return;
    }
  }
}

module.exports = { createConsumer, closeConsumer };