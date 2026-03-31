const { createRouter, getRouter } = require('../config/mediasoup');
const { logger } = require('../../../shared/utils/logger');

let routerInstance = null;

async function initRouter() {
  if (!routerInstance) {
    routerInstance = await createRouter();
    logger.info('Mediasoup router initialized');
  }
  return routerInstance;
}

function getRouterInstance() {
  if (!routerInstance) {
    throw new Error('Router not initialized');
  }
  return routerInstance;
}

module.exports = { initRouter, getRouterInstance };