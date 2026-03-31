const express = require('express');
const enrollmentController = require('../controllers/enrollment.controller');
const { authenticate } = require('../../../shared/middleware/auth');

const router = express.Router();

router.get('/my', authenticate, enrollmentController.getMyEnrollments);
router.put('/progress', authenticate, enrollmentController.updateProgress);

module.exports = router;