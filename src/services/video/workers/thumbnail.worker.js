const thumbnailService = require('../services/thumbnail.service');
const { logger } = require('../../../shared/utils/logger');

async function processThumbnail(job) {
  try {
    await thumbnailService.generateThumbnail(
      job.videoId,
      job.timestamp,
      job.size
    );
    logger.info(`Thumbnail generated: ${job.videoId}`);
  } catch (error) {
    logger.error(`Thumbnail failed: ${job.videoId}`, error);
    throw error;
  }
}

module.exports = { processThumbnail };