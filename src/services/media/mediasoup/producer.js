const { getRouterInstance } = require('./router');
const { logger } = require('../../../shared/utils/logger');

async function createProducer(transportId, kind, rtpParameters) {
  const router = getRouterInstance();
  const transport = router._getTransport(transportId);
  
  if (!transport) {
    throw new Error('Transport not found');
  }
  
  const producer = await transport.produce({
    kind,
    rtpParameters
  });
  
  logger.info(`Producer created: ${producer.id} (${kind})`);
  return producer;
}

async function closeProducer(producerId) {
  const router = getRouterInstance();
  // Find and close producer
  for (const transport of router._transports.values()) {
    const producer = transport._producers.get(producerId);
    if (producer) {
      await producer.close();
      logger.info(`Producer closed: ${producerId}`);
      return;
    }
  }
}

module.exports = { createProducer, closeProducer };