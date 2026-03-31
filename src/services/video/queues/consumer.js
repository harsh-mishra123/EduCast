const { consumeQueue, QUEUES, ackMessage } = require('../../../shared/utils/rabbitmq');
const transcodeService = require('../services/transcode.service');
const { logger } = require('../../../shared/utils/logger');

async function startConsumers() {
  await consumeQueue(QUEUES.VIDEO_UPLOADED, async (message) => {
    logger.info('Processing video upload:', message.videoId);
    
    try {
      await transcodeService.transcodeVideo(
        message.videoId,
        message.objectName,
        message.bucket
      );
    } catch (error) {
      logger.error(`Transcoding failed for ${message.videoId}:`, error);
      throw error;
    }
  });
  
  logger.info('Video service consumers started');
}

module.exports = { startConsumers };