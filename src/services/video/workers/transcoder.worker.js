// This is a background worker that processes transcoding jobs
// In production, this would be a separate process or Kubernetes job

const transcodeService = require('../services/transcode.service');
const { logger } = require('../../../shared/utils/logger');

async function processJob(job) {
  try {
    await transcodeService.transcodeVideo(
      job.videoId,
      job.objectName,
      job.bucket
    );
    logger.info(`Job completed: ${job.videoId}`);
  } catch (error) {
    logger.error(`Job failed: ${job.videoId}`, error);
    throw error;
  }
}

module.exports = { processJob };