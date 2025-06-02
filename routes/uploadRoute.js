const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2; // Import Cloudinary v2
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Import CloudinaryStorage
const User = require('../models/User'); // Ensure this path is correct

const router = express.Router();

// --- Cloudinary Configuration ---
// Make sure these environment variables are set in your .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Multer-Storage-Cloudinary Configuration ---
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wpd_videos', // Specify a folder in Cloudinary for your videos
        resource_type: 'video', // Set resource type to 'video'
        allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'], // Specify allowed video formats
        // You can add more transformations here if needed, e.g., eager: [{ width: 300, height: 300, crop: "pad" }]
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max file size (Cloudinary has its own limits too)
    fileFilter: (req, file, cb) => {
        // Basic mimetype check, Cloudinary also handles allowed_formats
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed!'), false);
        }
    },
});

// @route POST /api/upload?email=...
// This route now uploads video directly to Cloudinary
router.post('/', upload.single('video'), async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            // If email is missing, and a file was uploaded, delete it from Cloudinary
            if (req.file && req.file.public_id) {
                await cloudinary.uploader.destroy(req.file.public_id, { resource_type: 'video' });
            }
            return res.status(400).json({ message: 'Email query param is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // If user not found, and a file was uploaded, delete it from Cloudinary
            if (req.file && req.file.public_id) {
                await cloudinary.uploader.destroy(req.file.public_id, { resource_type: 'video' });
            }
            return res.status(404).json({ message: 'User not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No video file uploaded' });
        }

        // `req.file.path` contains the Cloudinary secure URL after successful upload
        const videoUrl = req.file.path; // This is the secure_url from Cloudinary
        const publicId = req.file.public_id; // Store public_id to allow deletion/management later

        // If a video already exists for this user, delete the old one from Cloudinary
        if (user.videoUrl && user.publicId) {
            try {
                await cloudinary.uploader.destroy(user.publicId, { resource_type: 'video' });
                console.log(`Old video with public_id ${user.publicId} deleted from Cloudinary.`);
            } catch (deleteError) {
                console.warn(`Could not delete old video with public_id ${user.publicId}:`, deleteError.message);
                // Continue despite deletion error to update with new video
            }
        }

        user.videoUrl = videoUrl;
        user.publicId = publicId; // Save the Cloudinary public_id
        user.videoUploadedAt = new Date(); // You might want to track this
        user.isApproved = false; // Reset approval status if a new video is uploaded
        user.approvedBy = null;
        user.approvedAt = null;
        user.annotation = user.annotation || ""; // Ensure annotation is not lost on re-upload

        // --- IMPORTANT CHANGE HERE: Set status to 'pending' instead of 'submitted' ---
        user.status = 'pending'; // Changed from 'submitted' to 'pending' as per enum

        await user.save();

        // Return the entire user object, which now includes the updated videoUrl
        res.status(200).json(user);

    } catch (err) {
        console.error('Upload Error:', err);
        // If an error occurs during processing (e.g., DB save failure),
        // and a file was already uploaded to Cloudinary, delete it.
        if (req.file && req.file.public_id) {
            try {
                await cloudinary.uploader.destroy(req.file.public_id, { resource_type: 'video' });
                console.log(`Uploaded file with public_id ${req.file.public_id} deleted due to upload error.`);
            } catch (deleteError) {
                console.error('Error deleting failed Cloudinary upload:', deleteError.message);
            }
        }
        res.status(500).json({ message: err.message || 'Video upload failed' });
    }
});

// @route GET /api/upload/users/video?email=...
// This endpoint is for fetching user video *data* (metadata), not the stream.
// This route is fine here as it's directly related to the upload process.
router.get('/users/video', async (req, res) => {
    console.log('Requested user video data for email:', req.query.email);
    const email = req.query.email;
    if (!email) {
        return res.status(400).json({ message: 'Email query parameter is required.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json(null);
        }

        res.status(200).json(user);

    } catch (error) {
        console.error('Error fetching user video data:', error);
        res.status(500).json({ message: 'Server error fetching video data.' });
    }
});

// --- REMOVED: Local video streaming route ---
// router.get('/uploads/videos/:filename', ...);
// This route is no longer needed as videos are streamed directly from Cloudinary.

module.exports = router;