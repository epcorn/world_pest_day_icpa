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

router.get('/submissions', authAdmin, async (req, res) => {
    try {
        const usersWithVideos = await User.find({ videoUrl: { $ne: null } })
            .select('name email companyName mobile videoUrl isVerified isApproved annotation')
            .sort({ videoUploadedAt: -1 });

        const submissions = usersWithVideos.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            companyName: user.companyName,
            mobile: user.mobile,
            videoUrl: user.videoUrl,
            isVerified: user.isVerified,
            isApproved: user.isApproved
        }));

        res.status(200).json(submissions);
    } catch (err) {
        console.error('Error fetching submissions:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/approve/:userId', authAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let message = 'Certificate re-sent successfully.';

        if (!user.isApproved) {
            user.isApproved = true;
            user.approvedBy = req.admin._id;
            user.approvedAt = new Date();
            user.status = 'approved';
            await user.save();
            message = 'User video approved and certificate emailed successfully.';
        }

        const issueDate = new Date().toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const userAnnotationPrefix = user.annotation ? `${user.annotation} ` : "";

        const certificateHtml = generateCertificateHTML(
            userAnnotationPrefix,
            user.name,
            user.companyName || 'N/A',
            issueDate
        );

        console.log('[Puppeteer] Attempting to launch browser...');
        // --- UPDATED: Use CHROME_BIN instead of GOOGLE_CHROME_BIN ---
        console.log('DEBUG: CHROME_BIN is:', process.env.CHROME_BIN);
        // You can remove the GOOGLE_CHROME_BIN log if you're sure you're not using it.
        // console.log('DEBUG: GOOGLE_CHROME_BIN is:', process.env.GOOGLE_CHROME_BIN);
        // -------------------------------------------------------------

        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--single-process',
                '--no-zygote' // Added for robustness on Heroku
            ],
            // --- CRITICAL CHANGE: Use process.env.CHROME_BIN ---
            executablePath: process.env.CHROME_BIN
            // ----------------------------------------------------
        });
        console.log('[Puppeteer] Browser launched successfully!');

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

        const certificatesDir = path.join(__dirname, '../Uploads/certificates');
        if (!fs.existsSync(certificatesDir)) {
            fs.mkdirSync(certificatesDir, { recursive: true });
        }
        const pdfPath = path.join(certificatesDir, `certificate_${user._id}.pdf`);
        fs.writeFileSync(pdfPath, pdfBuffer);

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

        fs.unlinkSync(pdfPath); // Clean up the generated PDF file

        res.status(200).json({ message: message });

    } catch (err) {
        console.error('Error approving user:', err);
        // Provide more detail in the error response for debugging
        res.status(500).json({ message: 'Server error during certificate generation or email sending.', error: err.message });
    }
});

router.get('/dashboard', authAdmin, (req, res) => {
    res.json({ message: `Welcome admin ${req.admin.email}` });
});

module.exports = router;
