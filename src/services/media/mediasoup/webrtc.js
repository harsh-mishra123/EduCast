const { getWorkerInstance } = require('./worker');
const { createWebRtcTransport } = require('./transport');
const { createProducer } = require('./producer');
const { createConsumer } = require('./consumer');
const { logger } = require('../../../shared/utils/logger');

class WebRTCManager {
  async createTransport(roomId, peerId) {
    const transport = await createWebRtcTransport({
      enableTcp: true,
      enableUdp: true,
      preferUdp: true
    });
    
    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters
    };
  }
  
  async connectTransport(transportId, dtlsParameters) {
    const router = require('./router').getRouterInstance();
    const transport = router._getTransport(transportId);
    
    if (!transport) {
      throw new Error('Transport not found');
    }
    
    await transport.connect({ dtlsParameters });
    logger.info(`Transport connected: ${transportId}`);
    return true;
  }
  
  async produce(transportId, kind, rtpParameters) {
    const producer = await createProducer(transportId, kind, rtpParameters);
    return producer;
  }
  
  async consume(transportId, producerId, rtpCapabilities) {
    const consumer = await createConsumer(transportId, producerId, rtpCapabilities);
    return consumer;
  }
  
  async closeTransport(transportId) {
    const router = require('./router').getRouterInstance();
    const transport = router._getTransport(transportId);
    
    if (transport) {
      await transport.close();
      logger.info(`Transport closed: ${transportId}`);
    }
  }
}

module.exports = new WebRTCManager();