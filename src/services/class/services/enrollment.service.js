const Enrollment = require('../models/Enrollment');
const courseService = require('./course.service');
const lectureService = require('./lecture.service');

class EnrollmentService {
  async enrollInCourse(userId, courseId, amount, paymentId) {
    // Check if already enrolled
    const existing = await Enrollment.findOne({ userId, courseId, type: 'course' });
    if (existing) {
      throw new Error('Already enrolled in this course');
    }
    
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      type: 'course',
      amount,
      paymentId,
      status: 'active'
    });
    
    await courseService.incrementEnrollment(courseId);
    await courseService.incrementRevenue(courseId, amount);
    
    return enrollment;
  }
  
  async enrollInLecture(userId, lectureId, amount, paymentId) {
    // Check if already enrolled
    const existing = await Enrollment.findOne({ userId, lectureId, type: 'live' });
    if (existing) {
      throw new Error('Already enrolled in this lecture');
    }
    
    // Check seat availability
    const lecture = await lectureService.getLectureById(lectureId);
    if (lecture.maxStudents && lecture.totalEnrolled >= lecture.maxStudents) {
      throw new Error('Lecture is full');
    }
    
    const enrollment = await Enrollment.create({
      userId,
      lectureId,
      type: 'live',
      amount,
      paymentId,
      status: 'active'
    });
    
    await lectureService.incrementEnrollment(lectureId);
    
    return enrollment;
  }
  
  async getUserEnrollments(userId) {
    const enrollments = await Enrollment.find({ userId })
      .populate('courseId')
      .populate('lectureId')
      .sort({ enrolledAt: -1 });
    
    return enrollments;
  }
  
  async getCourseEnrollments(courseId) {
    return await Enrollment.find({ courseId, type: 'course' }).populate('userId', 'name email');
  }
  
  async getLectureEnrollments(lectureId) {
    return await Enrollment.find({ lectureId, type: 'live' }).populate('userId', 'name email');
  }
  
  async updateProgress(userId, courseId, progress) {
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId, courseId, type: 'course' },
      { progress },
      { new: true }
    );
    
    if (progress === 100) {
      enrollment.completedAt = new Date();
      enrollment.status = 'completed';
      await enrollment.save();
    }
    
    return enrollment;
  }
  
  async issueCertificate(userId, courseId, certificateUrl) {
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId, courseId, type: 'course', status: 'active' },
      { certificateIssued: true, certificateUrl, status: 'completed', completedAt: new Date() },
      { new: true }
    );
    
    if (!enrollment) throw new Error('Enrollment not found');
    return enrollment;
  }
}

module.exports = new EnrollmentService();