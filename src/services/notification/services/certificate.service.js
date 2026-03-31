const puppeteer = require('puppeteer');
const path = require('path');
const Handlebars = require('handlebars');
const fs = require('fs');
const { logger } = require('../../../shared/utils/logger');

class CertificateService {
  async generateCertificate({ name, courseTitle, date, certificateId }) {
    const templatePath = path.join(__dirname, '../templates/certificate.hbs');
    let html = '';
    
    try {
      const source = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(source);
      
      html = template({
        name,
        courseTitle,
        date: date || new Date().toLocaleDateString(),
        certificateId
      });
    } catch (error) {
      logger.warn('Certificate template not found, using default');
      html = `
        <div style="text-align:center; padding:50px; border:10px solid gold;">
          <h1>Certificate of Completion</h1>
          <p>This certifies that</p>
          <h2>${name}</h2>
          <p>has successfully completed</p>
          <h3>${courseTitle}</h3>
          <p>on ${date || new Date().toLocaleDateString()}</p>
          <p>Certificate ID: ${certificateId}</p>
        </div>
      `;
    }
    
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(html);
      await page.setViewport({ width: 1200, height: 800 });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }
      });
      
      return pdf;
    } finally {
      await browser.close();
    }
  }
}

module.exports = new CertificateService();