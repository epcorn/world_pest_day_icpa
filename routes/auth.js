const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// POST /api/users/register
router.post('/register', async (req, res) => {
  const { annotation, name, companyName, email, mobile } = req.body;
  
  try {
    // Validate input
    if (!email || !name || !companyName || !mobile) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check for existing verified user
    const existingVerifiedUser = await User.findOne({ email, isVerified: true });
    if (existingVerifiedUser) {
      return res.status(400).json({ message: 'Email already registered and verified.' });
    }

    // Create verification token
    const token = jwt.sign(
      { name, companyName, email, mobile }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Verification link
    const verifyLink = `${process.env.BASE_URL || 'https://world-pest-day-api.onrender.com'}/api/users/verify?token=${token}`;

    // Send verification email
    await sendEmail(
      email, 
      'Verify Your Email', 
      `Please verify your email by clicking this link: <a href="${verifyLink}">Verify Email</a>`
    );

    // Create or update user
    const user = await User.findOneAndUpdate(
      { email },
      {
        annotation,
        name,
        companyName,
        mobile,
        isVerified: false,
        verificationSentAt: new Date(),
        lastReminderSentAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'Verification email sent. Please check your inbox.',
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /api/users/check
router.post('/check', async (req, res) => {
  try {
    const { annotation, email, name, companyName, mobile } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check details match
    if (
      user.annotation === annotation &&
      user.name === name &&
      user.companyName === companyName &&
      user.mobile === mobile
    ) {
      return res.status(200).json({
        videoUrl: user.videoUrl || '',
        isVerified: user.isVerified,
        name: user.name,
        companyName: user.companyName,
        mobile: user.mobile,
        annotation: user.annotation,
      });
    } else {
      return res.status(400).json({
        message: 'User details do not match. Please check your information.',
      });
    }
  } catch (error) {
    console.error('Error in /check:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// GET /api/users/verify
router.get('/verify', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Verification token is required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      const newUser = new User({
        name: decoded.name,
        companyName: decoded.companyName,
        email: decoded.email,
        mobile: decoded.mobile,
        isVerified: true,
        verificationSentAt: new Date(),
        lastReminderSentAt: new Date()
      });
      await newUser.save();
      return res.send('Email verified successfully. You may now upload your video.');
    }

    if (user.isVerified) {
      return res.status(200).send('Email already verified.');
    }

    user.isVerified = true;
    await user.save();

    return res.send('Email verified successfully. You may now upload your video.');
  } catch (err) {
    console.error('Verification Error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(400).send('Verification link has expired. Please register again.');
    }
    return res.status(400).send('Invalid verification token.');
  }
});

module.exports = router;