const { publishToQueue, QUEUES } = require('../../../shared/utils/rabbitmq');

async function publishCoursePublished(educatorId, courseId, courseTitle) {
  await publishToQueue(QUEUES.EMAIL_REMINDER, {
    type: 'course_published',
    educatorId,
    courseId,
    courseTitle
  });
}

async function publishLectureScheduled(educatorId, lectureId, title, scheduledTime) {
  await publishToQueue(QUEUES.EMAIL_REMINDER, {
    type: 'lecture_scheduled',
    educatorId,
    lectureId,
    title,
    scheduledTime
  });
}

async function publishLectureStarted(lectureId, educatorId, roomId, title) {
  await publishToQueue(QUEUES.LIVE_STARTED, {
    lectureId,
    educatorId,
    roomId,
    title
  });
}

async function publishLectureEnded(lectureId, educatorId, roomId, startedAt, endedAt) {
  await publishToQueue(QUEUES.LIVE_ENDED, {
    lectureId,
    educatorId,
    roomId,
    startedAt,
    endedAt
  });
}

module.exports = {
  publishCoursePublished,
  publishLectureScheduled,
  publishLectureStarted,
  publishLectureEnded
};