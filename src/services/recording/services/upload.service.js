const fs = require('fs');
const { getMinio, ensureBucket } = require('../../video/config/minio');
const { logger } = require('../../../shared/utils/logger');

class UploadService {
  constructor() {
    this.bucketName = process.env.MINIO_BUCKET || 'classcast-videos';
  }
  
  async initialize() {
    await ensureBucket(this.bucketName);
  }
  
  async uploadRecording(lectureId, filePath, metadata) {
    const minio = getMinio();
    const objectName = `recordings/${lectureId}/${Date.now()}_recording.mp4`;
    
    const fileStream = fs.createReadStream(filePath);
    const fileStat = fs.statSync(filePath);
    
    await minio.putObject(
      this.bucketName,
      objectName,
      fileStream,
      fileStat.size,
      { 'Content-Type': 'video/mp4' }
    );
    
    logger.info(`Recording uploaded: ${objectName}`);
    
    return {
      url: `${this.bucketName}/${objectName}`,
      objectName,
      size: fileStat.size
    };
  }
  
  async uploadThumbnail(lectureId, filePath) {
    const minio = getMinio();
    const objectName = `thumbnails/lectures/${lectureId}/thumbnail.jpg`;
    
    const fileStream = fs.createReadStream(filePath);
    const fileStat = fs.statSync(filePath);
    
    await minio.putObject(
      this.bucketName,
      objectName,
      fileStream,
      fileStat.size,
      { 'Content-Type': 'image/jpeg' }
    );
    
    return `${this.bucketName}/${objectName}`;
  }
}

module.exports = new UploadService();