const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// NEW: Import Cloudinary
const cloudinary = require('cloudinary').v2;

const authRoutes = require("./routes/auth");
const uploadRoute = require('./routes/uploadRoute');
const adminRoutes = require('./routes/adminRoute');

const app = express();

// --- REVISED CORS Configuration for Generic Use ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'https://world-pest-day-client.onrender.com', // Your live Render frontend URL
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

// --- Cloudinary Configuration (NEW ADDITION) ---
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

// Static files (Keep for now, but will be removed/commented out later)
// app.use('/uploads', express.static(path.join(__dirname, 'Uploads'))); // Will be removed

// API Routes
app.use("/api/users", authRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/admin", adminRoutes);

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