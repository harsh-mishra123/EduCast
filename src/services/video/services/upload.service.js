const { v4: uuidv4 } = require('uuid');
const Video = require('../models/Video');
const { getMinio, ensureBucket } = require('../config/minio');
const { publishToQueue, QUEUES } = require('../../../shared/utils/rabbitmq');
const { logger } = require('../../../shared/utils/logger');

class UploadService {
  constructor() {
    this.bucketName = process.env.MINIO_BUCKET || 'classcast-videos';
  }
  
  async initialize() {
    try {
      await ensureBucket(this.bucketName);
      logger.info('Upload service initialized');
    } catch (error) {
      logger.warn('Upload service initialization warning:', error.message);
    }
  }
  
  async uploadVideo(educatorId, file, metadata) {
    // For now, mock upload since MinIO might not be fully configured
    const videoId = uuidv4();
    
    const video = await Video.create({
      educatorId,
      courseId: metadata.courseId,
      lectureId: metadata.lectureId,
      title: metadata.title || 'Untitled Video',
      description: metadata.description,
      filename: `mock-${videoId}.mp4`,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      status: 'ready'
    });
    
    logger.info(`Video uploaded (mock): ${video._id}`);
    return video;
  }
  
  async getVideo(videoId) {
    return await Video.findById(videoId);
  }
  
  async getEducatorVideos(educatorId) {
    return await Video.find({ educatorId }).sort({ createdAt: -1 });
  }
  
  async deleteVideo(videoId, educatorId) {
    const video = await Video.findOne({ _id: videoId, educatorId });
    if (!video) throw new Error('Video not found');
    await video.deleteOne();
    logger.info(`Video deleted: ${videoId}`);
    return video;
  }
}

module.exports = new UploadService();
