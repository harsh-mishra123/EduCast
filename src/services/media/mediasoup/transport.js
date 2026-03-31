const { getRouterInstance } = require('./router');
const { logger } = require('../../../shared/utils/logger');

async function createWebRtcTransport(transportOptions) {
  const router = getRouterInstance();
  
  const transport = await router.createWebRtcTransport({
    listenIps: [
      {
        ip: process.env.LISTEN_IP || '0.0.0.0',
        announcedIp: process.env.ANNOUNCED_IP
      }
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    ...transportOptions
  });
  
  logger.info(`WebRTC transport created: ${transport.id}`);
  return transport;
}

async function createPlainTransport(transportOptions) {
  const router = getRouterInstance();
  
  const transport = await router.createPlainTransport({
    listenIp: {
      ip: process.env.LISTEN_IP || '0.0.0.0',
      announcedIp: process.env.ANNOUNCED_IP
    },
    rtcpMux: true,
    comedia: true,
    ...transportOptions
  });
  
  logger.info(`Plain transport created: ${transport.id}`);
  return transport;
}

async function closeTransport(transportId) {
  const router = getRouterInstance();
  const transport = router._getTransport(transportId);
  
  if (transport) {
    await transport.close();
    logger.info(`Transport closed: ${transportId}`);
  }
}

module.exports = {
  createWebRtcTransport,
  createPlainTransport,
  closeTransport
};