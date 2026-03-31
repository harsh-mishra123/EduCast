const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { sendEmail } = require('../config/email');
const { logger } = require('../../../shared/utils/logger');

class EmailService {
  constructor() {
    this.templates = {};
    this.loadTemplates();
  }
  
  loadTemplates() {
    const templateDir = path.join(__dirname, '../templates');
    const templates = ['welcome', 'live-started', 'payment-confirmed', 'reminder', 'certificate'];
    
    for (const template of templates) {
      const filePath = path.join(templateDir, `${template}.hbs`);
      try {
        const source = fs.readFileSync(filePath, 'utf8');
        this.templates[template] = Handlebars.compile(source);
      } catch (error) {
        logger.warn(`Template not found: ${template}`);
      }
    }
  }
  
  async sendWelcomeEmail(to, name) {
    const html = this.templates.welcome?.({ name }) || `<h1>Welcome ${name}!</h1>`;
    
    return await sendEmail({
      to,
      subject: 'Welcome to ClassCast! 🎉',
      html
    });
  }
  
  async sendLiveStartedEmail(to, name, lectureTitle, joinUrl) {
    const html = this.templates['live-started']?.({ name, lectureTitle, joinUrl }) ||
      `<h1>${lectureTitle} is now live!</h1><a href="${joinUrl}">Join Now</a>`;
    
    return await sendEmail({
      to,
      subject: `🔴 Live Now: ${lectureTitle}`,
      html
    });
  }
  
  async sendPaymentConfirmationEmail(to, name, itemTitle, amount) {
    const html = this.templates['payment-confirmed']?.({ name, itemTitle, amount }) ||
      `<h1>Payment Confirmed!</h1><p>You purchased ${itemTitle} for ₹${amount}</p>`;
    
    return await sendEmail({
      to,
      subject: `✅ Payment Confirmed: ${itemTitle}`,
      html
    });
  }
  
  async sendReminderEmail(to, name, lectureTitle, startTime, joinUrl) {
    const html = this.templates.reminder?.({ name, lectureTitle, startTime, joinUrl }) ||
      `<h1>Reminder: ${lectureTitle}</h1><p>Starts at ${startTime}</p><a href="${joinUrl}">Join</a>`;
    
    return await sendEmail({
      to,
      subject: `⏰ Reminder: ${lectureTitle}`,
      html
    });
  }
  
  async sendCertificateEmail(to, name, courseTitle, certificateUrl) {
    const html = this.templates.certificate?.({ name, courseTitle, certificateUrl }) ||
      `<h1>Certificate of Completion</h1><p>Congratulations ${name}!</p><a href="${certificateUrl}">Download Certificate</a>`;
    
    return await sendEmail({
      to,
      subject: `🎓 Your Certificate for ${courseTitle}`,
      html
    });
  }
}

module.exports = new EmailService();