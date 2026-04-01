const nodemailer = require('nodemailer');
const config = require('../../../shared/config/env');
const { logger } = require('../../../shared/utils/logger');

let transporter = null;

function initEmail() {
  if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
    logger.warn('Email not configured. Email features will not work.');
    return null;
  }
  
  transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  
  logger.info('Email transporter initialized');
  return transporter;
}

async function sendEmail({ to, subject, html, text, from = config.EMAIL_FROM }) {
  if (!transporter) {
    logger.warn('Email not configured, skipping send');
    return { messageId: 'mock', accepted: [to], rejected: [] };
  }
  
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });
    
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}

module.exports = { initEmail, sendEmail };
