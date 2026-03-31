const enrollmentService = require('../services/enrollment.service');

class EnrollmentController {
  async getMyEnrollments(req, res) {
    try {
      const enrollments = await enrollmentService.getUserEnrollments(req.user.userId);
      res.json(enrollments);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async updateProgress(req, res) {
    try {
      const { courseId, progress } = req.body;
      const enrollment = await enrollmentService.updateProgress(req.user.userId, courseId, progress);
      res.json(enrollment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new EnrollmentController();