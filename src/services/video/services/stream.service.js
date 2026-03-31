const { getMinio } = require('../config/minio');
const Video = require('../models/Video');

class StreamService {
  constructor() {
    this.bucketName = process.env.MINIO_BUCKET || 'classcast-videos';
  }
  
  async getStreamUrl(videoId) {
    const video = await Video.findById(videoId);
    if (!video) throw new Error('Video not found');
    
    if (video.status !== 'ready') {
      throw new Error('Video is not ready for streaming');
    }
    
    return video.hlsUrl;
  }
  
  async getManifest(videoId) {
    const video = await Video.findById(videoId);
    if (!video) throw new Error('Video not found');
    
    const minio = getMinio();
    const manifestPath = video.hlsUrl.replace(`${this.bucketName}/`, '');
    
    const stream = await minio.getObject(this.bucketName, manifestPath);
    return stream;
  }
  
  async getSegment(videoId, segmentName) {
    const video = await Video.findById(videoId);
    if (!video) throw new Error('Video not found');
    
    const minio = getMinio();
    const segmentPath = `hls/${video.educatorId}/${videoId}/${segmentName}`;
    
    const stream = await minio.getObject(this.bucketName, segmentPath);
    return stream;
  }
  
  async getThumbnail(videoId) {
    const video = await Video.findById(videoId);
    if (!video) throw new Error('Video not found');
    
    if (!video.thumbnailUrl) {
      throw new Error('Thumbnail not available');
    }
    
    const minio = getMinio();
    const thumbPath = video.thumbnailUrl.replace(`${this.bucketName}/`, '');
    
    const stream = await minio.getObject(this.bucketName, thumbPath);
    return stream;
  }
}

module.exports = new StreamService();