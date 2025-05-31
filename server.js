const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
require("dotenv").config();

// Import your routes
const authRoutes = require("./routes/auth");
console.log('authRoutes loaded:', !!authRoutes);
const uploadRoute = require('./routes/uploadRoute');
console.log('uploadRoute loaded:', !!uploadRoute);
const adminRoutes = require('./routes/adminRoute');
console.log('adminRoutes loaded:', !!adminRoutes);

const app = express();

// --- START CORS CONFIGURATION ---
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

// Apply the configured CORS middleware
app.use(cors(corsOptions));

// --- ADD THIS LINE to handle preflight requests globally ---
app.options('*', cors(corsOptions)); // Handles OPTIONS requests for all routes

// Middleware
app.use(express.json());

// Serve static files from 'Uploads'
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// API Routes
app.use("/api/users", authRoutes);
app.use("/api/upload", uploadRoute);
app.use('/api/admin', adminRoutes);

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Port
const PORT = process.env.PORT || 5000;

// Remove sensitive logs for security
// console.log('EMAIL_USER:', process.env.EMAIL_USER);
// console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("✅ MongoDB connected");
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch((err) => {
  console.error("❌ DB Connection Error:", err);
});