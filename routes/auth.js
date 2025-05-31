const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const cors = require('cors');

// Your CORS configuration from server.js
const allowedOrigins = [
  'https://world-pest-day-client.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Handle preflight (OPTIONS) for /check
router.options('/check', cors(corsOptions));

// POST /api/users/register
router.post('/register', async (req, res) => {
  const { annotation , name, companyName, email, mobile } = req.body;
  console.log('Register request received:', { annotation,name, companyName, email, mobile });

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const existingVerifiedUser = await User.findOne({ email, isVerified: true });
    if (existingVerifiedUser) {
      console.log('Existing verified user found:', email);
      return res.status(400).json({ message: 'Email already registered and verified.' });
    }

    const token = jwt.sign({ name, companyName, email, mobile }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verifyLink = `http://localhost:${process.env.PORT || 5000}/api/verify?token=${token}`;
    console.log('Verification link:', verifyLink);

    console.log('Sending email to:', email);
    await sendEmail(email, 'Verify Your Email', `Click here to verify: <a href="${verifyLink}">${verifyLink}</a>`);
    console.log('Email sent successfully to:', email);

    const user = await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          annotation,
          name,
          companyName,
          mobile,
          email,
          isVerified: false,
          verificationSentAt: new Date(),
          lastReminderSentAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
    console.log('User saved:', user.email);

    res.status(200).json({
      message: 'Verification email sent. You can now upload your video. Please check your inbox.',
    });
  } catch (err) {
    console.error('Registration error:', err.stack);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// POST /api/users/check
router.post('/check', cors(corsOptions), async (req, res) => {
  try {
    const { annotation, email, name, companyName, mobile } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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
        message: 'User details do not match. Please check your information and try again.',
      });
    }
  } catch (error) {
    console.error('Error in /check:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/verify
router.get('/verify', async (req, res) => {
  const { token } = req.query;

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
    return res.status(400).send('Invalid or expired token.');
  }
});

module.exports = router;
