const LiveLecture = require('../models/LiveLecture');
const { publishToQueue, QUEUES } = require('../../../shared/utils/rabbitmq');
const { logger } = require('../../../shared/utils/logger');

class LiveLectureService {
  async scheduleLecture(educatorId, lectureData) {
    const lecture = await LiveLecture.create({
      educatorId,
      ...lectureData,
      status: 'scheduled'
    });
    
    // Schedule reminder (would be handled by a cron job in production)
    await publishToQueue(QUEUES.EMAIL_REMINDER, {
      type: 'lecture_scheduled',
      educatorId,
      lectureId: lecture._id,
      title: lecture.title,
      scheduledTime: lecture.scheduledStartTime
    });
    
    logger.info(`Lecture scheduled: ${lecture._id} by educator ${educatorId}`);
    return lecture;
  }
  
  async getLectureById(lectureId) {
    return await LiveLecture.findById(lectureId);
  }
  
  async getEducatorLectures(educatorId) {
    return await LiveLecture.find({ educatorId }).sort({ scheduledStartTime: 1 });
  }
  
  async getUpcomingLectures() {
    return await LiveLecture.find({
      status: 'scheduled',
      scheduledStartTime: { $gt: new Date() }
    }).sort({ scheduledStartTime: 1 });
  }
  
  async getLiveLectures() {
    return await LiveLecture.find({
      status: 'live'
    });
  }
  
  async startLecture(lectureId, educatorId) {
    const lecture = await LiveLecture.findOneAndUpdate(
      { _id: lectureId, educatorId, status: 'scheduled' },
      {
        status: 'live',
        actualStartTime: new Date()
      },
      { new: true }
    );
    
    if (!lecture) throw new Error('Lecture not found or already started');
    
    await publishToQueue(QUEUES.LIVE_STARTED, {
      lectureId: lecture._id,
      educatorId,
      roomId: lecture.roomId,
      title: lecture.title,
      scheduledStartTime: lecture.scheduledStartTime
    });
    
    logger.info(`Lecture started: ${lecture._id}`);
    return lecture;
  }
  
  async endLecture(lectureId, educatorId) {
    const lecture = await LiveLecture.findOneAndUpdate(
      { _id: lectureId, educatorId, status: 'live' },
      {
        status: 'ended',
        actualEndTime: new Date()
      },
      { new: true }
    );
    
    if (!lecture) throw new Error('Lecture not found or not live');
    
    await publishToQueue(QUEUES.LIVE_ENDED, {
      lectureId: lecture._id,
      educatorId,
      roomId: lecture.roomId,
      startedAt: lecture.actualStartTime,
      endedAt: lecture.actualEndTime
    });
    
    logger.info(`Lecture ended: ${lecture._id}`);
    return lecture;
  }
  
  async incrementEnrollment(lectureId) {
    return await LiveLecture.findByIdAndUpdate(
      lectureId,
      { $inc: { totalEnrolled: 1 } },
      { new: true }
    );
  }
  
  async updatePeakViewers(lectureId, currentViewers) {
    const lecture = await LiveLecture.findById(lectureId);
    if (lecture && currentViewers > lecture.peakViewers) {
      lecture.peakViewers = currentViewers;
      await lecture.save();
    }
    return lecture;
  }
  
  async addRecording(lectureId, educatorId, recordingUrl) {
    const lecture = await LiveLecture.findOneAndUpdate(
      { _id: lectureId, educatorId },
      {
        recordingUrl,
        recordingAvailable: true,
        status: 'recorded'
      },
      { new: true }
    );
    
    if (!lecture) throw new Error('Lecture not found');
    
    await publishToQueue(QUEUES.CERTIFICATE_READY, {
      type: 'recording_ready',
      lectureId,
      title: lecture.title,
      recordingUrl
    });
    
    return lecture;
  }
  
  async cancelLecture(lectureId, educatorId) {
    const lecture = await LiveLecture.findOneAndUpdate(
      { _id: lectureId, educatorId, status: 'scheduled' },
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!lecture) throw new Error('Lecture not found or already started');
    
    await publishToQueue(QUEUES.EMAIL_REMINDER, {
      type: 'lecture_cancelled',
      educatorId,
      lectureId,
      title: lecture.title
    });
    
    return lecture;
  }
}

module.exports = new LiveLectureService();