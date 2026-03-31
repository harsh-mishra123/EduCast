const recordingService = require('../services/recording.service');
const uploadService = require('../services/upload.service');
const { publishToQueue, QUEUES } = require('../../../shared/utils/rabbitmq');
const { logger } = require('../../../shared/utils/logger');

async function processRecordingJob(job) {
  const { lectureId, streamUrl, metadata } = job;
  
  try {
    // Start recording
    const recordingId = await recordingService.startRecording(lectureId, streamUrl);
    
    // Wait for recording to complete (would be event-driven in production)
    // This is a simplified version
    
    // Stop recording after lecture ends
    // This would be triggered by an event
    
    const recording = await recordingService.getRecording(recordingId);
    
    if (recording && recording.status === 'completed') {
      // Upload to MinIO
      const uploadResult = await uploadService.uploadRecording(
        lectureId,
        recording.outputPath,
        metadata
      );
      
      // Clean up
      await recordingService.deleteRecording(recordingId);
      
      // Notify video service to transcode
      await publishToQueue(QUEUES.VIDEO_UPLOADED, {
        lectureId,
        objectName: uploadResult.objectName,
        bucket: uploadService.bucketName,
        metadata
      });
      
      logger.info(`Recording processed: ${lectureId}`);
    }
  } catch (error) {
    logger.error(`Recording failed for ${lectureId}:`, error);
    throw error;
  }
}

module.exports = { processRecordingJob };