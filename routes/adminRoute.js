const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authAdmin = require('../Middleware/adminAuth');
const Admin = require('../models/Admin');
const User = require('../models/User');
const generateCertificateHTML = require('./certificateTemplate');
const sendCertificateEmail = require('../utils/sendCertificateEmail');
const fs = require('fs'); // Re-added for temporary file operations
const path = require('path'); // Re-added for path manipulation

// ADDED: ConvertAPI initialization
const ConvertAPI = require('convertapi');

// --- Diagnostic: Check if CONVERTAPI_SECRET is loaded ---
console.log('CONVERTAPI_SECRET loaded:', process.env.CONVERTAPI_SECRET ? 'YES' : 'NO');
// For debugging, you can temporarily log the value, but be careful in production:
// console.log('CONVERTAPI_SECRET value (DEBUG ONLY):', process.env.CONVERTAPI_SECRET);
// --------------------------------------------------------

const convertapi = new ConvertAPI(process.env.CONVERTAPI_SECRET); // Use environment variable for API token

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
            .select('name email companyName mobile videoUrl isVerified isApproved annotation certificateUrl')
            .sort({ videoUploadedAt: -1 });

        const submissions = usersWithVideos.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            companyName: user.companyName,
            mobile: user.mobile,
            videoUrl: user.videoUrl,
            isVerified: user.isVerified,
            isApproved: user.isApproved,
            certificateUrl: user.certificateUrl
        }));

        res.status(200).json(submissions);
    } catch (err) {
        console.error('Error fetching submissions:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/approve/:userId', authAdmin, async (req, res) => {
    let tempHtmlFilePath = null; // Declare outside try block for cleanup in catch
    try {
        console.log(`[APPROVE] Request received for userId: ${req.params.userId}`);

        const user = await User.findById(req.params.userId);
        if (!user) {
            console.warn(`[APPROVE] User not found: ${req.params.userId}`);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(`[APPROVE] User found: ${user.email}, isApproved: ${user.isApproved}`);

        let message = 'Certificate re-sent successfully.';
        let certificateUrl = user.certificateUrl; // Initialize with existing URL if any

        if (!user.isApproved) {
            user.isApproved = true;
            user.approvedBy = req.admin._id;
            user.approvedAt = new Date();
            user.status = 'approved';
            message = 'User video approved and certificate emailed successfully.';
            console.log('[APPROVE] User status changed to approved.');
        } else {
            console.log('[APPROVE] User already approved. Resending certificate.');
        }

        const issueDate = new Date().toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const userAnnotationPrefix = user.annotation ? `${user.annotation} ` : "";

        // --- Reverting to original certificate HTML generation ---
        const certificateHtml = generateCertificateHTML(userAnnotationPrefix, user.name, user.companyName || 'N/A', issueDate);
        // --- End of change ---

        console.log('[APPROVE] Certificate HTML generated (first 500 chars):', certificateHtml.substring(0, 500));
        // WARNING: Avoid logging entire HTML in production environments due to potential size/security issues.
        // --------------------------------------------------------

        console.log('[ConvertAPI] Initiating HTML to PDF conversion...');

        // Create a temporary HTML file
        tempHtmlFilePath = path.join(__dirname, `temp_certificate_${user._id}.html`);
        console.log(`[APPROVE] Writing temporary HTML to: ${tempHtmlFilePath}`);
        await fs.promises.writeFile(tempHtmlFilePath, certificateHtml, 'utf8');

        // Convert the temporary HTML file to PDF using ConvertAPI
        const convertApiResult = await convertapi.convert('pdf', { // Target format is PDF
            File: tempHtmlFilePath, // Send the path to the temporary HTML file
            FileName: `World_Pest_Day_Certificate_${user.name}.pdf`, // Suggested filename
            PageOrientation: 'landscape', // Ensure landscape format
            PageSize: 'A4', // Ensure A4 size
            MarginTop: 0,
            MarginBottom: 0,
            MarginLeft: 0,
            MarginRight: 0,
            Scale: 90 // Corrected: Scales down the content to fit the page (adjust value as needed, between 10 and 200)
        }, 'html'); // Source format is HTML

        console.log('[APPROVE] ConvertAPI conversion successful.');

        // Get the URL of the generated PDF
        const pdfFile = convertApiResult.files[0];
        if (!pdfFile || !pdfFile.url) {
            console.error('[APPROVE ERROR] ConvertAPI did not return a valid PDF URL. Result:', JSON.stringify(convertApiResult));
            throw new Error('ConvertAPI did not return a valid PDF URL.');
        }
        const generatedPdfUrl = pdfFile.url;
        certificateUrl = generatedPdfUrl; // Update certificateUrl with the new one

        user.certificateUrl = certificateUrl; // Save the generated URL to the user document
        await user.save();
        console.log('[APPROVE] User document saved with new certificate URL.');

        console.log('[APPROVE] Initiating email sending...');
        const emailSubject = 'Congratulations! Your World Pest Day Certificate';
        const emailHtml = `
            <h1>Congratulations, ${user.name}!</h1>
            <p>Thank you for participating in World Pest Day, celebrated by the Indian Pest Control Association.</p>
            <p>Attached is your certificate of participation.</p>
            <p>You can also download it directly from this link: <a href="${generatedPdfUrl}">${generatedPdfUrl}</a></p>
            <p>Best regards,<br>Indian Pest Control Association</p>
        `;
        const attachments = [
            {
                filename: `World_Pest_Day_Certificate_${user.name}.pdf`,
                href: generatedPdfUrl, // Nodemailer can take a URL for attachments
                contentType: 'application/pdf'
            }
        ];

        await sendCertificateEmail(user.email, emailSubject, emailHtml, attachments);
        console.log('[APPROVE] Certificate email sent successfully.');

        res.status(200).json({ message: message, certificateUrl: certificateUrl });

    } catch (err) {
        console.error('[APPROVE ERROR] Error approving user or generating certificate:', err);
        // Log more specific ConvertAPI errors if available
        if (err.response && err.response.data) {
            console.error('[APPROVE ERROR] ConvertAPI/Axios Error Details:', err.response.data);
        }
        if (err.name === 'MongooseError' || err.name === 'ValidationError') {
            console.error('[APPROVE ERROR] Mongoose specific error:', err.message);
        }
        res.status(500).json({ message: 'Server error during certificate generation or email sending.', error: err.message });
    } finally {
        // Ensure temporary file is deleted even if errors occur
        if (tempHtmlFilePath) {
            try {
                await fs.promises.unlink(tempHtmlFilePath);
                console.log(`[APPROVE] Cleaned up temporary HTML file: ${tempHtmlFilePath}`);
            } catch (cleanupErr) {
                console.error(`[APPROVE ERROR] Failed to clean up temporary HTML file ${tempHtmlFilePath}:`, cleanupErr);
            }
        }
    }
});

router.get('/dashboard', authAdmin, (req, res) => {
    res.json({ message: `Welcome admin ${req.admin.email}` });
});

module.exports = router;
