const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config(); // This line is good to keep for local development

const authRoutes = require("./routes/auth");
const uploadRoute = require('./routes/uploadRoute');
const adminRoutes = require('./routes/adminRoute');

const app = express();

// --- REVISED CORS Configuration for Generic Use ---
// Allow common local development origins and provide a placeholder for production
const allowedOrigins = [
  'http://localhost:5173', // Common for Vite/React dev server
  'http://localhost:3000',  // Common for Create React App dev server
  'http://localhost:8080',  // Another common local dev port
  // IMPORTANT: Add your production frontend URL(s) here when you deploy your frontend
  // Example for Heroku frontend: 'https://your-heroku-frontend-app.herokuapp.com',
  // If you keep your Render frontend: 'https://world-pest-day-client.onrender.com',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman/curl, or same-origin requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // You can log the blocked origin for debugging if needed
      console.log(`CORS blocked: Origin '${origin}' not allowed.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 204 // Important for handling preflight requests
};

app.use(cors(corsOptions));
// --- END REVISED CORS Configuration ---

// --- Useful Diagnostic Logging (Keep for debugging on any platform) ---
app.use((req, res, next) => {
  // Logs all incoming requests to the console
  console.log(`[DIAGNOSTIC] Incoming Request: ${req.method} ${req.url} from ${req.ip}`);
  next();
});
// --- END Diagnostic Logging ---


// Body parsing middleware (Standard and essential)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (Standard for serving static assets, like your 'Uploads' folder)
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// API Routes (Standard and essential for your application logic)
app.use("/api/users", authRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/admin", adminRoutes);

// Test endpoint (Standard and useful for health checks)
app.get('/test', (req, res) => {
  console.log('[DIAGNOSTIC] Hit /test endpoint!'); // Log when this specific route is hit
  res.json({ message: 'API is working!' });
});

// Error handling middleware (Standard and good practice)
app.use((err, req, res, next) => {
  console.error('[DIAGNOSTIC] Error Middleware:', err.stack); // Log errors
  res.status(500).json({ message: 'Something broke!' });
});

// Server Port (Standard for cloud platforms and local dev)
const PORT = process.env.PORT || 5000; // Use process.env.PORT for cloud, fallback to 5000 locally

// MongoDB Connection and Server Start
mongoose.connect(process.env.MONGO_URI) // Uses MONGO_URI env var (set locally in .env, on cloud via dashboard)
  .then(() => {
    console.log("✅ MongoDB connected");
    console.log(`[DIAGNOSTIC] Attempting to listen on port ${PORT}`);
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1); // Exit if DB connection fails
  });