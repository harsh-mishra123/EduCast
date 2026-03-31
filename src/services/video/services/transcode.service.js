const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Video = require('../models/Video');
const { getMinio } = require('../config/minio');
const { publishToQueue, QUEUES } = require('../../../shared/utils/rabbitmq');
const { logger } = require('../../../shared/utils/logger');

class TranscodeService {
  constructor() {
    this.bucketName = process.env.MINIO_BUCKET || 'classcast-videos';
    this.tempDir = path.join(os.tmpdir(), 'classcast-transcode');
    
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }
  
  async transcodeVideo(videoId, objectName, bucket) {
    const video = await Video.findById(videoId);
    if (!video) throw new Error('Video not found');
    
    const minio = getMinio();
    const tempInputPath = path.join(this.tempDir, `${videoId}_input.mp4`);
    const tempOutputDir = path.join(this.tempDir, `${videoId}_hls`);
    const tempThumbPath = path.join(this.tempDir, `${videoId}_thumb.jpg`);
    
    try {
      // Download from MinIO
      await minio.fGetObject(bucket, objectName, tempInputPath);
      
      // Create output directory
      if (!fs.existsSync(tempOutputDir)) {
        fs.mkdirSync(tempOutputDir, { recursive: true });
      }
      
      // Get video duration
      const duration = await this.getVideoDuration(tempInputPath);
      
      // Generate thumbnail
      await this.generateThumbnail(tempInputPath, tempThumbPath);
      
      // Upload thumbnail
      const thumbnailStream = fs.createReadStream(tempThumbPath);
      const thumbObjectName = `thumbnails/${video.educatorId}/${videoId}/thumb.jpg`;
      await minio.putObject(this.bucketName, thumbObjectName, thumbnailStream);
      
      // Transcode to HLS
      const hlsUrl = await this.generateHLS(videoId, tempInputPath, tempOutputDir);
      
      // Upload HLS files
      const hlsObjectPrefix = `hls/${video.educatorId}/${videoId}/`;
      const files = fs.readdirSync(tempOutputDir);
      
      for (const file of files) {
        const fileStream = fs.createReadStream(path.join(tempOutputDir, file));
        await minio.putObject(this.bucketName, `${hlsObjectPrefix}${file}`, fileStream);
      }
      
      // Update video record
      video.status = 'ready';
      video.duration = duration;
      video.thumbnailUrl = `${this.bucketName}/${thumbObjectName}`;
      video.hlsUrl = `${this.bucketName}/${hlsObjectPrefix}master.m3u8`;
      video.processedAt = new Date();
      await video.save();
      
      // Publish transcoded event
      await publishToQueue(QUEUES.VIDEO_TRANSCODED, {
        videoId: video._id,
        educatorId: video.educatorId,
        duration,
        hlsUrl: video.hlsUrl
      });
      
      logger.info(`Video transcoded: ${videoId}`);
      
    } catch (error) {
      logger.error(`Transcoding failed for ${videoId}:`, error);
      
      video.status = 'failed';
      video.processingError = error.message;
      await video.save();
      
      throw error;
    } finally {
      // Cleanup temp files
      this.cleanup([tempInputPath, tempThumbPath, tempOutputDir]);
    }
  }
  
  async getVideoDuration(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata.format.duration);
      });
    });
  }
  
  async generateThumbnail(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: ['00:00:05'],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '320x180'
        })
        .on('end', resolve)
        .on('error', reject);
    });
  }
  
  async generateHLS(videoId, inputPath, outputDir) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-hls_time 10',
          '-hls_list_size 0',
          '-hls_segment_filename', `${outputDir}/segment_%03d.ts`,
          '-f hls',
          '-start_number 0'
        ])
        .output(`${outputDir}/master.m3u8`)
        .on('end', () => resolve(`${outputDir}/master.m3u8`))
        .on('error', reject)
        .run();
    });
  }
  
  cleanup(paths) {
    for (const p of paths) {
      try {
        if (fs.existsSync(p)) {
          if (fs.lstatSync(p).isDirectory()) {
            fs.rmSync(p, { recursive: true, force: true });
          } else {
            fs.unlinkSync(p);
          }
        }
      } catch (error) {
        logger.warn(`Failed to cleanup ${p}:`, error);
      }
    }
  }
}

module.exports = new TranscodeService();