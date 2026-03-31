const uploadService = require('../services/upload.service');
const { logger } = require('../../../shared/utils/logger');

class VideoController {
  async uploadVideo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const video = await uploadService.uploadVideo(
        req.user.userId,
        req.file,
        req.body
      );
      
      res.status(201).json(video);
    } catch (error) {
      logger.error('Upload error:', error);
      res.status(400).json({ error: error.message });
    }
  }
  
  async getVideo(req, res) {
    try {
      const video = await uploadService.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      res.json(video);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getMyVideos(req, res) {
    try {
      const videos = await uploadService.getEducatorVideos(req.user.userId);
      res.json(videos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async deleteVideo(req, res) {
    try {
      await uploadService.deleteVideo(req.params.id, req.user.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getStreamUrl(req, res) {
    try {
      // Mock stream URL
      res.json({ url: `http://localhost:3004/api/video/${req.params.id}/manifest.m3u8` });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getManifest(req, res) {
    try {
      res.set('Content-Type', 'application/vnd.apple.mpegurl');
      res.send('#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-STREAM-INF:BANDWIDTH=800000\nstream.m3u8');
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getSegment(req, res) {
    try {
      res.set('Content-Type', 'video/MP2T');
      res.send('Mock segment data');
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getThumbnail(req, res) {
    try {
      res.set('Content-Type', 'image/jpeg');
      // Send a simple placeholder
      const { createCanvas } = require('canvas');
      const canvas = createCanvas(320, 180);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#4F46E5';
      ctx.fillRect(0, 0, 320, 180);
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText('No Thumbnail', 100, 90);
      res.send(canvas.toBuffer());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new VideoController();
