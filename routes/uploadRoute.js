const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User'); // Ensure this path is correct

const router = express.Router();

// Ensure upload folder exists
const uploadDir = path.join(__dirname, '../Uploads/videos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for saving to disk
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // It's good practice to ensure unique filenames without special characters
        // and add an extension. Using originalname directly might cause issues.
        // Let's ensure a clean filename.
        const fileExt = path.extname(file.originalname);
        const fileNameWithoutExt = path.basename(file.originalname, fileExt);
        const uniqueName = `video-${Date.now()}-${fileNameWithoutExt.replace(/[^a-zA-Z0-9]/g, '')}${fileExt}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed!'), false);
        }
    },
});

// @route POST /api/upload?email=...
// This route now returns the full user object after successful upload
router.post('/', upload.single('video'), async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) return res.status(400).json({ message: 'Email query param is required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (!req.file) return res.status(400).json({ message: 'No video file uploaded' });

        const videoUrl = `/uploads/videos/${req.file.filename}`; // This path is relative to your static serve directory
        user.videoUrl = videoUrl;
        await user.save();

        // **IMPORTANT CHANGE HERE:**
        // Return the entire user object, which now includes the updated videoUrl
        // The frontend `setUserVideo(res.data)` expects this structure.
        res.status(200).json(user);

    } catch (err) {
        console.error('Upload Error:', err);
        // Clean up uploaded file if an error occurs during DB update
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting failed upload file:', unlinkErr);
            });
        }
        res.status(500).json({ message: err.message || 'Video upload failed' });
    }
});


// @route GET /api/users/video?email=...
// This is the new endpoint for fetching user video *data* (metadata), not the stream.
// It should be placed in your auth.js or a dedicated user route file, not here,
// as this file is for upload and streaming.
// I'm putting it here for now for demonstration but recommend moving it.
router.get('/users/video', async (req, res) => {
    console.log('Requested user video data for email:', req.query.email);
    const email = req.query.email;
    if (!email) {
        return res.status(400).json({ message: 'Email query parameter is required.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            // If user not found, return an object indicating no video rather than 404
            // This allows the frontend to differentiate between "no user" and "user exists but no video"
            return res.status(200).json(null); // Or { message: "No video found for this user" }
        }

        // **IMPORTANT CHANGE HERE:**
        // Return the entire user object. This matches what VideoSubmissionPage expects.
        // The frontend will check `user.videoUrl` to see if a video exists.
        res.status(200).json(user);

    } catch (error) {
        console.error('Error fetching user video data:', error);
        res.status(500).json({ message: 'Server error fetching video data.' });
    }
});


// @route GET /uploads/videos/:filename
// This route is for streaming the actual video file, keep this separate.
// This should probably be handled by serving static files in your main server.js
// or app.js file, not as a specific route here unless you need custom streaming logic.
// I'm including it here for completeness, but it's likely already handled elsewhere.
// If your current setup works for showing the video, you don't need to change this part.
router.get('/uploads/videos/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '..', 'Uploads', 'videos', filename);

    if (!fs.existsSync(filepath)) {
        console.log('File does not exist at:', filepath);
        return res.status(404).json({ message: 'Video file not found' });
    }

    const stat = fs.statSync(filepath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(filepath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(filepath).pipe(res);
    }
});


module.exports = router;