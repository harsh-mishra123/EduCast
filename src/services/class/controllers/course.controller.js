const courseService = require('../services/course.service');

class CourseController {
  async createCourse(req, res) {
    try {
      const course = await courseService.createCourse(req.user.userId, req.body);
      res.status(201).json(course);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getMyCourses(req, res) {
    try {
      const courses = await courseService.getEducatorCourses(req.user.userId, req.query.status);
      res.json(courses);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getAllCourses(req, res) {
    try {
      const courses = await courseService.getPublishedCourses();
      res.json(courses);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getCourse(req, res) {
    try {
      const course = await courseService.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      res.json(course);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async updateCourse(req, res) {
    try {
      const course = await courseService.updateCourse(req.params.id, req.user.userId, req.body);
      res.json(course);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async publishCourse(req, res) {
    try {
      const course = await courseService.publishCourse(req.params.id, req.user.userId);
      res.json(course);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async deleteCourse(req, res) {
    try {
      await courseService.deleteCourse(req.params.id, req.user.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CourseController();