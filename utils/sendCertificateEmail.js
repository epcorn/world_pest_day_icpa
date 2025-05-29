const nodemailer = require('nodemailer');

const sendCertificateEmail = async (to, subject, html, attachments = []) => {
  if (!to || !subject || !html) {
    throw new Error('Missing required email parameters');
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new Error('Invalid recipient email format');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // For local testing only
    }
  });

  const mailOptions = {
    from: `"World Pest Day Team" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High'
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`, {
      messageId: info.messageId,
      timestamp: new Date()
    });
    return info;
  } catch (error) {
    console.error('Email send failed:', {
      recipient: to,
      error: error.message,
      response: error.response,
      stack: error.stack
    });
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

module.exports = sendCertificateEmail;