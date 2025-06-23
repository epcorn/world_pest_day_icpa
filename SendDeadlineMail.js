const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Environment variables
const MONGO_URI = process.env.MONGO_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  annotation: String
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

// Main function
const sendEmails = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({});

    for (const user of users) {
      const { email, name, annotation } = user;

      const mailOptions = {
        from: `"IPCA - World Pest Day 2025" <${EMAIL_USER}>`,
        to: email,
        subject: '🎉 Deadline Extended: Now Submit Your Video by August 15!',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h3>Dear ${annotation || ''} ${name || 'Participant'},</h3>
            <p>We hope you're doing well!</p>
            <p>Due to multiple requests and overwhelming participation interest, we are <strong>extending the video submission deadline</strong> <span style="color:green;"><strong>from June 15th, 2025 to August 15th, 2025</strong></span>.</p>
            <p>This gives you extra time to record and share your amazing work in promoting public health through pest control.</p>
            <p>If you’ve already submitted, thank you! You may help others join as well by sharing this news.</p>
            
            <p style="margin-top: 20px;">
              👉 <a href="https://wpd.webconnectipca.com/" target="_blank" style="color: #1a73e8; font-weight: bold;">Visit the Website & Submit Now</a>
            </p>

            <br />
            <p>Warm regards,<br/><strong>Indian Pest Control Association (IPCA)</strong></p>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to: ${email}`);
      } catch (err) {
        console.error(`❌ Failed to send to ${email}:`, err.message);
      }
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

sendEmails();
