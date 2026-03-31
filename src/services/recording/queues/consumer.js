const { consumeQueue, QUEUES } = require('../../../shared/utils/rabbitmq');
const { processRecordingJob } = require('../workers/recording.worker');
const { logger } = require('../../../shared/utils/logger');

async function startConsumers() {
  await consumeQueue(QUEUES.LIVE_STARTED, async (message) => {
    logger.info('Recording: Live started event received:', message.lectureId);
    
    // Start recording when live starts
    const job = {
      lectureId: message.lectureId,
      streamUrl: `rtmp://media-server/live/${message.roomId}`,
      metadata: {
        title: message.title,
        educatorId: message.educatorId
      }
    };
    
    await processRecordingJob(job);
  });
  
  logger.info('Recording service consumers started');
}

module.exports = { startConsumers };