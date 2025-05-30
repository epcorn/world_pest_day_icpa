const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
require("dotenv").config();

// Import your routes
const authRoutes = require("./routes/auth");
const uploadRoute = require('./routes/uploadRoute');
const adminRoutes = require('./routes/adminRoute');

const app = express();

// --- START CORS CONFIGURATION ---
// Define the specific origins that are allowed to access your backend API
const allowedOrigins = [
  'https://world-pest-day-client.onrender.com', // **YOUR DEPLOYED FRONTEND URL**
  'http://localhost:5173',                   // For local frontend development (Vite default)
  // Add other local development origins if you use a different port, e.g., 'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or same-origin requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly list all HTTP methods your API uses
  allowedHeaders: ['Content-Type', 'Authorization'], // Crucial for headers like 'Authorization' (for JWT tokens)
  credentials: true // Set to true if your frontend sends cookies or authorization headers
};

// Apply the configured CORS middleware
app.use(cors(corsOptions));
// --- END CORS CONFIGURATION ---

// Middleware
app.use(express.json()); // This should typically come after CORS for correct header processing

// 1. Serve static files from the 'Uploads' folder (e.g., for user-uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// 2. API Routes - These MUST come BEFORE any client-side static file serving
app.use("/api/users", authRoutes);
app.use("/api/upload", uploadRoute);
app.use('/api/admin', adminRoutes);

// (The commented-out client-side static serving is correct as your frontend is deployed separately)

// Port
const PORT = process.env.PORT || 5000;
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("✅ MongoDB connected");
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch((err) => {
  console.error("❌ DB Connection Error:", err);
});