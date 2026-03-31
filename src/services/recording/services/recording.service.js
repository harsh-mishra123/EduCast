const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../../../shared/utils/logger');

class RecordingService {
  constructor() {
    this.recordings = new Map();
    this.tempDir = path.join(os.tmpdir(), 'classcast-recordings');
    
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }
  
  startRecording(lectureId, streamUrl) {
    const recordingId = uuidv4();
    const outputPath = path.join(this.tempDir, `${lectureId}_${recordingId}.mp4`);
    
    const command = ffmpeg(streamUrl)
      .inputOptions(['-re'])
      .outputOptions([
        '-c:v libx264',
        '-c:a aac',
        '-preset ultrafast',
        '-crf 23',
        '-movflags +faststart'
      ])
      .output(outputPath)
      .on('start', () => {
        logger.info(`Recording started: ${recordingId} for lecture ${lectureId}`);
      })
      .on('error', (err) => {
        logger.error(`Recording error ${recordingId}:`, err);
        this.recordings.delete(recordingId);
      })
      .on('end', async () => {
        logger.info(`Recording ended: ${recordingId}`);
        
        const recording = this.recordings.get(recordingId);
        if (recording) {
          recording.status = 'completed';
          recording.outputPath = outputPath;
        }
      });
    
    command.run();
    
    this.recordings.set(recordingId, {
      id: recordingId,
      lectureId,
      streamUrl,
      outputPath,
      status: 'recording',
      command,
      startTime: new Date()
    });
    
    return recordingId;
  }
  
  async stopRecording(recordingId) {
    const recording = this.recordings.get(recordingId);
    if (!recording) {
      throw new Error('Recording not found');
    }
    
    recording.command.kill('SIGINT');
    
    // Wait for end event
    return new Promise((resolve) => {
      recording.command.on('end', () => {
        resolve(recording.outputPath);
      });
    });
  }
  
  async getRecording(recordingId) {
    return this.recordings.get(recordingId);
  }
  
  async getLectureRecording(lectureId) {
    for (const [id, recording] of this.recordings) {
      if (recording.lectureId === lectureId) {
        return recording;
      }
    }
    return null;
  }
  
  async deleteRecording(recordingId) {
    const recording = this.recordings.get(recordingId);
    if (recording && recording.outputPath && fs.existsSync(recording.outputPath)) {
      fs.unlinkSync(recording.outputPath);
    }
    this.recordings.delete(recordingId);
  }
}

module.exports = new RecordingService();