const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authAdmin = require('../Middleware/adminAuth'); // Assuming this is correct
const Admin = require('../models/Admin');
const User = require('../models/User'); // Ensure this path is correct
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const generateCertificateHTML = require('./certificateTemplate'); // Assuming this path is correct
const sendCertificateEmail = require('../utils/sendCertificateEmail'); // Assuming this path is correct

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
            // IMPORTANT: Select 'isApproved' along with other fields
            .select('name email companyName mobile videoUrl isVerified isApproved annotation')
            .sort({ videoUploadedAt: -1 });

        const submissions = usersWithVideos.map(user => ({
            _id: user._id,
            name: user.name, // Use 'name' for consistency
            email: user.email,
            companyName: user.companyName,
            mobile: user.mobile, // Include mobile
            videoUrl: user.videoUrl,
            isVerified: user.isVerified, // Email verification status
            isApproved: user.isApproved // <--- IMPORTANT: Send new approval status
        }));

        res.status(200).json(submissions);
    } catch (err) {
        console.error('Error fetching submissions:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/// @route   POST /api/admin/approve/:userId
// @desc    Approve a user's video, generate certificate, and send email (allows re-sending)
router.post('/approve/:userId', authAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // --- IMPORTANT CHANGE HERE ---
        // Instead of returning an error if already approved,
        // we'll proceed to re-send the certificate.
        // We still ensure isApproved is true, and update timestamps if it was just approved.

        let message = 'Certificate re-sent successfully.'; // Default message for re-send

        if (!user.isApproved) {
            // Only update approval status and timestamps if not already approved
            user.isApproved = true;
            user.approvedBy = req.admin._id; // Assuming `req.admin` is set by your auth middleware
            user.approvedAt = new Date(); // Update the approval timestamp
            user.status = 'approved'; // Make sure this matches your enum values if used
            await user.save(); // Save the updated user status
            message = 'User video approved and certificate emailed successfully.'; // Message for initial approval
        }

        // --- Certificate Generation and Email Sending (Existing logic - now always runs) ---
        // Format current date (e.g., "29 May 2025")
        const issueDate = new Date().toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const userAnnotationPrefix = user.annotation ? `${user.annotation} ` : "";

        // Generate certificate HTML
        const certificateHtml = generateCertificateHTML(
            userAnnotationPrefix,
            user.name,
            user.companyName || 'N/A',
            issueDate
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
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
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

        // Respond with the appropriate message
        res.status(200).json({ message: message }); // <--- Send the dynamically set message

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