const { publishToQueue, QUEUES } = require('../../../shared/utils/rabbitmq');

async function publishVideoUploaded(videoId, educatorId, objectName, bucket, metadata) {
  await publishToQueue(QUEUES.VIDEO_UPLOADED, {
    videoId,
    educatorId,
    objectName,
    bucket,
    metadata
  });
}

async function publishVideoTranscoded(videoId, educatorId, duration, hlsUrl) {
  await publishToQueue(QUEUES.VIDEO_TRANSCODED, {
    videoId,
    educatorId,
    duration,
    hlsUrl
  });
}

module.exports = {
  publishVideoUploaded,
  publishVideoTranscoded
};