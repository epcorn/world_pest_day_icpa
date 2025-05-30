const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authAdmin = require('../Middleware/adminAuth');
const Admin = require('../models/Admin');
const User = require('../models/User');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const generateCertificateHTML = require('./certificateTemplate');
const sendCertificateEmail = require('../utils/sendCertificateEmail');

const router = express.Router();

// @route   POST /api/admin/login
// @desc    Admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      adminId: admin._id
    });
  } catch (err) {
    console.error('Admin Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/submissions
// @desc    Get all users who uploaded a video
router.get('/submissions', authAdmin, async (req, res) => {
  try {
    const usersWithVideos = await User.find({ videoUrl: { $ne: null } })
      .select('name email companyName videoUrl isVerified')
      .sort({ videoUploadedAt: -1 });

    const submissions = usersWithVideos.map(user => ({
      _id: user._id,
      username: user.name,
      email: user.email,
      companyName: user.companyName,
      videoUrl: user.videoUrl,
      verified: user.isVerified
    }));

    res.status(200).json(submissions);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/approve/:userId
// @desc    Approve a user, generate certificate, and send email
router.post('/approve/:userId', authAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.approvedBy = req.admin._id;
    user.approvedAt = new Date();
    await user.save();

    // Format current date (e.g., "29 May 2025")
    const issueDate = new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Determine annotation (e.g., "Mr. ", "Ms. ", "Dr. ").
    // Assuming 'user.annotation' might be a field in your User model.
    // If not, you might need to add it or derive it based on other user data.
    // For now, if user.annotation is empty, we'll just pass an empty string.
    // The certificateTemplate.js will then display just the name.
    // If you want a default like "Mr. " when no annotation is provided by the user,
    // you would set it here: `const userAnnotationPrefix = user.annotation ? `${user.annotation} ` : "Mr. ";`
    const userAnnotationPrefix = user.annotation ? `${user.annotation} ` : ""; // Default to empty if no annotation in user model

    // Generate certificate HTML - Pass parameters in correct order
    const certificateHtml = generateCertificateHTML(
      userAnnotationPrefix, // Annotation (e.g., "Mr. ", "Dr. ")
      user.name,            // Participant's Name
      user.companyName || 'N/A', // Company Name
      issueDate             // Issue Date
    );

    // Launch Puppeteer to generate PDF
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(certificateHtml, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' } // CRITICAL: Remove Puppeteer default margins
    });
    await browser.close();

    // Save PDF temporarily
    const pdfPath = path.join(__dirname, '../Uploads/certificates', `certificate_${user._id}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Send email with certificate
    const emailSubject = 'Congratulations! Your World Pest Day Certificate';
    const emailHtml = `
      <h1>Congratulations, ${user.name}!</h1>
      <p>Thank you for participating in World Pest Day, celebrated by the Indian Pest Control Association.</p>
      <p>Attached is your certificate of participation.</p>
      <p>Best regards,<br>Indian Pest Control Association</p>
    `;
    const attachments = [
      {
        filename: `World_Pest_Day_Certificate_${user.name}.pdf`,
        path: pdfPath,
        contentType: 'application/pdf'
      }
    ];

    await sendCertificateEmail(user.email, emailSubject, emailHtml, attachments);

    // Clean up temporary PDF
    fs.unlinkSync(pdfPath);

    res.status(200).json({ message: 'User approved and certificate emailed successfully' });
  } catch (err) {
    console.error('Error approving user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Protected route to test auth
router.get('/dashboard', authAdmin, (req, res) => {
  res.json({ message: `Welcome admin ${req.admin.email}` });
});

module.exports = router;