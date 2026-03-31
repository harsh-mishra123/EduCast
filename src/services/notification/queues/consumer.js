const { consumeQueue, QUEUES, ackMessage } = require('../../../shared/utils/rabbitmq');
const emailService = require('../services/email.service');
const certificateService = require('../services/certificate.service');
const notificationService = require('../services/notification.service');
const { logger } = require('../../../shared/utils/logger');

async function startConsumers() {
  // Welcome emails
  await consumeQueue(QUEUES.EMAIL_WELCOME, async (message) => {
    logger.info('Sending welcome email:', message.email);
    await emailService.sendWelcomeEmail(message.email, message.name);
  });
  
  // Reminder emails
  await consumeQueue(QUEUES.EMAIL_REMINDER, async (message) => {
    logger.info('Sending reminder email:', message);
    
    switch (message.type) {
      case 'lecture_scheduled':
        await emailService.sendReminderEmail(
          message.email,
          message.name,
          message.title,
          message.scheduledTime,
          message.joinUrl
        );
        break;
      case 'course_published':
        // Handle course published notification
        break;
      default:
        logger.warn('Unknown reminder type:', message.type);
    }
  });
  
  // Live started notifications
  await consumeQueue(QUEUES.LIVE_STARTED, async (message) => {
    logger.info('Sending live started notifications for lecture:', message.lectureId);
    // Send to all enrolled students
    // This would require fetching enrolled students from DB
  });
  
  // Payment completed
  await consumeQueue(QUEUES.PAYMENT_COMPLETED, async (message) => {
    logger.info('Sending payment confirmation:', message);
    await emailService.sendPaymentConfirmationEmail(
      message.email,
      message.name,
      message.itemTitle,
      message.amount
    );
  });
  
  // Certificate ready
  await consumeQueue(QUEUES.CERTIFICATE_READY, async (message) => {
    logger.info('Generating certificate for:', message.userId);
    
    const pdf = await certificateService.generateCertificate({
      name: message.name,
      courseTitle: message.courseTitle,
      certificateId: message.certificateId
    });
    
    // Upload to MinIO and send email with link
    // await uploadToMinIO(pdf);
    // await emailService.sendCertificateEmail(...);
  });
  
  logger.info('Notification service consumers started');
}

module.exports = { startConsumers };