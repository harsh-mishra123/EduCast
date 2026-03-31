const express = require('express');
const axios = require('axios');
const config = require('../../shared/config/env');

const router = express.Router();

router.get('/', async (req, res) => {
  const services = {
    auth: `http://localhost:${config.AUTH_PORT}/health`,
    class: `http://localhost:${config.CLASS_PORT}/health`,
    payment: `http://localhost:${config.PAYMENT_PORT}/health`,
    video: `http://localhost:${config.VIDEO_PORT}/health`,
    chat: `http://localhost:${config.CHAT_PORT}/health`,
    notification: `http://localhost:${config.NOTIFICATION_PORT}/health`,
    media: `http://localhost:${config.MEDIA_PORT}/health`,
    signaling: `http://localhost:${config.SIGNALING_PORT}/health`,
    recording: `http://localhost:${config.RECORDING_PORT}/health`
  };
  
  const statuses = {};
  
  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      statuses[name] = response.data;
    } catch (error) {
      statuses[name] = { status: 'unhealthy', error: error.message };
    }
  }
  
  res.json({
    gateway: 'healthy',
    timestamp: new Date().toISOString(),
    services: statuses
  });
});

module.exports = router;