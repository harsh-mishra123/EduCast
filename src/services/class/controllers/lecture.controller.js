const lectureService = require('../services/lecture.service');

class LiveLectureController {
  async scheduleLecture(req, res) {
    try {
      const lecture = await lectureService.scheduleLecture(req.user.userId, req.body);
      res.status(201).json(lecture);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getMyLectures(req, res) {
    try {
      const lectures = await lectureService.getEducatorLectures(req.user.userId);
      res.json(lectures);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getUpcomingLectures(req, res) {
    try {
      const lectures = await lectureService.getUpcomingLectures();
      res.json(lectures);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getLiveLectures(req, res) {
    try {
      const lectures = await lectureService.getLiveLectures();
      res.json(lectures);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getLecture(req, res) {
    try {
      const lecture = await lectureService.getLectureById(req.params.id);
      if (!lecture) {
        return res.status(404).json({ error: 'Lecture not found' });
      }
      res.json(lecture);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async startLecture(req, res) {
    try {
      const lecture = await lectureService.startLecture(req.params.id, req.user.userId);
      res.json(lecture);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async endLecture(req, res) {
    try {
      const lecture = await lectureService.endLecture(req.params.id, req.user.userId);
      res.json(lecture);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async cancelLecture(req, res) {
    try {
      const lecture = await lectureService.cancelLecture(req.params.id, req.user.userId);
      res.json(lecture);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new LiveLectureController();