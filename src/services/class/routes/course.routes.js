const express = require('express');
const courseController = require('../controllers/course.controller');
const { authenticate, requireRole } = require('../../../shared/middleware/auth');

const router = express.Router();

// Public
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourse);

// Protected - Educator only
router.post('/', authenticate, requireRole(['educator']), courseController.createCourse);
router.get('/my/courses', authenticate, requireRole(['educator']), courseController.getMyCourses);
router.put('/:id', authenticate, requireRole(['educator']), courseController.updateCourse);
router.post('/:id/publish', authenticate, requireRole(['educator']), courseController.publishCourse);
router.delete('/:id', authenticate, requireRole(['educator']), courseController.deleteCourse);

module.exports = router;