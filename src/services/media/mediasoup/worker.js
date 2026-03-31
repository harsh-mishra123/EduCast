const { createWorker, getWorker } = require('../config/mediasoup');
const { logger } = require('../../../shared/utils/logger');

let workerInstance = null;

async function initWorker() {
  if (!workerInstance) {
    workerInstance = await createWorker();
    logger.info('Mediasoup worker initialized');
  }
  return workerInstance;
}

function getWorkerInstance() {
  if (!workerInstance) {
    throw new Error('Worker not initialized');
  }
  return workerInstance;
}

module.exports = { initWorker, getWorkerInstance };