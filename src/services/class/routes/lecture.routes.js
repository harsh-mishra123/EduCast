const express = require('express');
const lectureController = require('../controllers/lecture.controller');
const { authenticate, requireRole } = require('../../../shared/middleware/auth');

const router = express.Router();

// Public
router.get('/upcoming', lectureController.getUpcomingLectures);
router.get('/live', lectureController.getLiveLectures);
router.get('/:id', lectureController.getLecture);

// Protected - Educator only
router.post('/', authenticate, requireRole(['educator']), lectureController.scheduleLecture);
router.get('/my/lectures', authenticate, requireRole(['educator']), lectureController.getMyLectures);
router.post('/:id/start', authenticate, requireRole(['educator']), lectureController.startLecture);
router.post('/:id/end', authenticate, requireRole(['educator']), lectureController.endLecture);
router.post('/:id/cancel', authenticate, requireRole(['educator']), lectureController.cancelLecture);

module.exports = router;