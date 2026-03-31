const Course = require('../models/Course');
const { publishToQueue, QUEUES } = require('../../../shared/utils/rabbitmq');
const { logger } = require('../../../shared/utils/logger');

class CourseService {
  async createCourse(educatorId, courseData) {
    const course = await Course.create({
      educatorId,
      ...courseData
    });
    
    logger.info(`Course created: ${course._id} by educator ${educatorId}`);
    return course;
  }
  
  async getCourseById(courseId) {
    return await Course.findById(courseId);
  }
  
  async getEducatorCourses(educatorId, status = null) {
    const query = { educatorId };
    if (status) query.status = status;
    return await Course.find(query).sort({ createdAt: -1 });
  }
  
  async getPublishedCourses() {
    return await Course.find({ status: 'published' }).sort({ createdAt: -1 });
  }
  
  async updateCourse(courseId, educatorId, updateData) {
    const allowed = ['title', 'description', 'price', 'thumbnail', 'sections'];
    const update = {};
    
    for (const key of allowed) {
      if (updateData[key] !== undefined) {
        update[key] = updateData[key];
      }
    }
    
    const course = await Course.findOneAndUpdate(
      { _id: courseId, educatorId },
      { ...update, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!course) throw new Error('Course not found');
    return course;
  }
  
  async publishCourse(courseId, educatorId) {
    const course = await Course.findOneAndUpdate(
      { _id: courseId, educatorId },
      { status: 'published' },
      { new: true }
    );
    
    if (!course) throw new Error('Course not found');
    
    await publishToQueue(QUEUES.EMAIL_REMINDER, {
      type: 'course_published',
      educatorId,
      courseId,
      courseTitle: course.title
    });
    
    return course;
  }
  
  async incrementEnrollment(courseId) {
    return await Course.findByIdAndUpdate(
      courseId,
      { $inc: { totalStudents: 1 } },
      { new: true }
    );
  }
  
  async incrementRevenue(courseId, amount) {
    return await Course.findByIdAndUpdate(
      courseId,
      { $inc: { totalRevenue: amount } },
      { new: true }
    );
  }
  
  async deleteCourse(courseId, educatorId) {
    const course = await Course.findOneAndDelete({ _id: courseId, educatorId });
    if (!course) throw new Error('Course not found');
    return course;
  }
}

module.exports = new CourseService();