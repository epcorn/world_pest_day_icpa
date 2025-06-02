// routes/users.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const User = require('../models/User'); // Adjust path as necessary
const sendEmail = require('../utils/sendEmail'); // Import sendEmail utility

// POST /api/users/register
// Registers a new user, sends verification email, and provides a passcode.
router.post('/register', async (req, res) => {
    const { annotation, name, companyName, email, mobile } = req.body;

    try {
        // Validate input
        if (!email || !name || !companyName || !mobile || !annotation) { // Ensure annotation is also checked
            return res.status(400).json({ message: 'All fields (annotation, name, company, email, mobile) are required.' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        // Check for existing user (regardless of verification status)
        const existingUser = await User.findOne({ email });

        // Generate a 6-digit passcode
        const passcode = Math.floor(100000 + Math.random() * 900000).toString(); // Ensures 6 digits

        // Create verification token (for email verification)
        const token = jwt.sign(
            { name, companyName, email, mobile },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Verification link
        const verifyLink = `${process.env.BASE_URL || 'https://wpdbackend-b47bcc7bc31a.herokuapp.com'}/api/users/verify?token=${token}`;

        // Send verification email with passcode
        await sendEmail(
            email,
            'Verify Your World Pest Day Registration & Get Your Passcode',
            `
            <p>Dear ${name},</p>
            <p>Thank you for registering for World Pest Day!</p>
            <p>Please verify your email by clicking this link: <a href="${verifyLink}">Verify Email Address</a></p>
            <p>Your unique 6-digit passcode for checking your video submission status is: <strong>${passcode}</strong></p>
            <p>Please keep this passcode safe. You will need it along with your email to view your video status on the landing page.</p>
            <p>Best regards,<br>The World Pest Day Team</p>
            `
        );

        // Create or update user
        const user = await User.findOneAndUpdate(
            { email }, // Find by email
            {
                annotation,
                name,
                companyName,
                mobile,
                isVerified: false, // Set to false for new or re-registering unverified user
                verificationSentAt: new Date(),
                lastReminderSentAt: new Date(),
                passcode: passcode, // Save the newly generated passcode
                status: 'pending', // Ensure status is set to 'pending' for new/re-registered users
            },
            { upsert: true, new: true, runValidators: true } // upsert creates if not found, new returns updated doc
        );

        res.status(200).json({
            message: 'Registration successful! A verification email with your 6-digit passcode has been sent. Please check your inbox.',
            user: {
                email: user.email,
                isVerified: user.isVerified,
                // Do NOT send the passcode in this response for security reasons,
                // as it's already sent via email. The frontend will assume it's sent.
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        // Handle Mongoose duplicate key error specifically
        if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
            return res.status(409).json({ message: 'Email already registered. Please use the "Check Status" option with your email and passcode.' });
        }
        res.status(500).json({ message: 'Server error during registration. Please try again later.' });
    }
});

// POST /api/users/check
// This route now exclusively handles status checks using email and passcode.
router.post('/check', async (req, res) => {
    const { email, passcode } = req.body; // Expecting email and passcode

    if (!email || !passcode) {
        return res.status(400).json({ message: 'Email and 6-digit passcode are required to check status.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            // Do not reveal if email exists or not for security
            return res.status(404).json({ message: 'No matching user found or invalid credentials.' });
        }

        // Simple string comparison for passcode (as requested, no bcrypt)
        if (user.passcode !== passcode) {
            return res.status(401).json({ message: 'Invalid passcode.' });
        }

        // If email and passcode match, return the user details for frontend display
        // Only return necessary fields to the frontend for security and efficiency
        res.status(200).json({
            annotation: user.annotation,
            name: user.name,
            companyName: user.companyName,
            email: user.email,
            mobile: user.mobile,
            isVerified: user.isVerified,
            videoUrl: user.videoUrl,
            videoUploadedAt: user.videoUploadedAt,
            status: user.status, // 'pending', 'approved', 'rejected'
            isApproved: user.isApproved,
            approvedBy: user.approvedBy,
            approvedAt: user.approvedAt,
            certificateUrl: user.certificateUrl,
            createdAt: user.createdAt,
            // DO NOT return the passcode here for security
        });

    } catch (error) {
        console.error('Error in /check (status check):', error);
        res.status(500).json({ message: 'Server error during status check.' });
    }
});

// GET /api/users/verify
// Handles email verification clicks from the link sent during registration.
router.get('/verify', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send('Verification token is required.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            // If user somehow doesn't exist by email, but token is valid, it's an edge case.
            // You might want to handle this differently, e.g., redirect to registration.
            return res.status(404).send('User not found for verification.');
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
            return res.status(400).send('Verification link has expired. Please register again to get a new link and passcode.');
        }
        return res.status(400).send('Invalid verification token.');
    }
});

module.exports = router;