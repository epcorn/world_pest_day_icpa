const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path"); // path is still needed for other potential static assets or general pathing
require("dotenv").config();

// NEW: Import Cloudinary
const cloudinary = require('cloudinary').v2;

// Import your routes
const authRoutes = require("./routes/auth"); // Assuming users.js handles user auth
const uploadRoute = require('./routes/uploadRoute'); // This should be the file we just modified for Cloudinary uploads
const adminRoutes = require('./routes/adminRoute'); // Assuming admin.js handles admin specific routes

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'https://world-pest-day-client.onrender.com', // Your live Render frontend URL
  'https://wpd.webconnectipca.com',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked: Origin '${origin}' not allowed.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// --- Cloudinary Configuration ---
// Ensure these environment variables are set in your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Use secure URLs (https)
});
// --- END Cloudinary Configuration ---

// --- Useful Diagnostic Logging ---
app.use((req, res, next) => {
  console.log(`[DIAGNOSTIC] Incoming Request: ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- IMPORTANT: REMOVED LOCAL STATIC VIDEO SERVING ---
// This line is commented out/removed because videos are now served directly from Cloudinary.
// If you have other static files (like certificate images, *before* they were on Cloudinary)
// you might need a different static middleware for them, but for 'uploads' it's now obsolete.
// app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// If you have other static assets (e.g., frontend build, other images not on Cloudinary)
// you might need something like this:
// app.use(express.static(path.join(__dirname, 'public')));


// API Routes
app.use("/api/users", authRoutes); // Handles user registration, verification etc.
app.use("/api/upload", uploadRoute); // Handles video uploads to Cloudinary
app.use("/api/admin", adminRoutes); // Handles admin login, approvals, certificate generation

// Test endpoint
app.get('/test', (req, res) => {
  console.log('[DIAGNOSTIC] Hit /test endpoint!');
  res.json({ message: 'API is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[DIAGNOSTIC] Error Middleware:', err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Server Port
const PORT = process.env.PORT || 5000;

// MongoDB Connection and Server Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    console.log(`[DIAGNOSTIC] Attempting to listen on port ${PORT}`);
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  });