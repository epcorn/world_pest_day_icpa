const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

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
    const uniqueName = `video-${Date.now()}-${file.originalname}`;
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
router.post('/', upload.single('video'), async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ message: 'Email query param is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (!req.file) return res.status(400).json({ message: 'No video file uploaded' });

    const videoPath = path.join(uploadDir, req.file.filename);
    if (!fs.existsSync(videoPath)) {
      return res.status(500).json({ message: 'Video file not saved correctly' });
    }

    const videoUrl = `/uploads/videos/${req.file.filename}`;
    user.videoUrl = videoUrl;
    await user.save();

    const statusNote = user.isVerified
      ? 'Your video has been uploaded successfully.'
      : 'Your video has been uploaded successfully, but your email is still unverified. Please check your inbox to verify.';

    res.status(200).json({ message: statusNote, videoUrl });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
});

// @route GET /api/video?email=...
router.get('/video', async (req, res) => {
  console.log('Requested URL:', req.originalUrl);
  const email = req.query.email;
  if (!email) return res.status(400).json({ message: 'Email query param is required' });

  const user = await User.findOne({ email });
  if (!user || !user.videoUrl) return res.status(404).json({ message: 'Video not found for user' });

  const filename = path.basename(user.videoUrl);
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