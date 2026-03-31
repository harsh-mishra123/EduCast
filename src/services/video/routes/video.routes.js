const express = require('express');
const upload = require('../middleware/multer');
const videoController = require('../controllers/video.controller');
const { authenticate, requireRole } = require('../../../shared/middleware/auth');

const router = express.Router();

// Public streaming endpoints
router.get('/:id/stream', videoController.getStreamUrl);
router.get('/:id/manifest.m3u8', videoController.getManifest);
router.get('/:id/segments/:segment', videoController.getSegment);
router.get('/:id/thumbnail', videoController.getThumbnail);

// Protected
router.use(authenticate);

router.post('/upload', requireRole(['educator']), upload.single('video'), videoController.uploadVideo);
router.get('/my', requireRole(['educator']), videoController.getMyVideos);
router.get('/:id', videoController.getVideo);
router.delete('/:id', requireRole(['educator']), videoController.deleteVideo);

module.exports = router;
