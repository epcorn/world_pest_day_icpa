const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  if (!to || !subject || !html) {
    throw new Error('Missing email parameters (to, subject, or html content)');
  }

  try {
    console.log('EMAIL_USER:', process.env.EMAIL_USER); // Log env variables
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify SMTP connection
    await transporter.verify();
    console.log('✅ SMTP connection verified for', process.env.EMAIL_USER);

    const mailOptions = {
      from: `"World Pest Day" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: MessageID=${info.messageId}, Response=${info.response}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;