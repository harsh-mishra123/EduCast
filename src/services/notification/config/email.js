const nodemailer = require('nodemailer');
const config = require('../../../shared/config/env');

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS
  }
});

async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: config.EMAIL_FROM,
      to,
      subject,
      text,
      html
    });
    
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

module.exports = { sendEmail };