const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const uploadRoute = require('./routes/uploadRoute');
const adminRoutes = require('./routes/adminRoute');

const app = express();

// --- START Centralized & Explicit CORS Configuration ---
const allowedOrigins = [
  'https://world-pest-day-client.onrender.com', // Your Render frontend URL
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
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
// --- END Centralized & Explicit CORS Configuration ---

// --- NEW DIAGNOSTIC LOGGING ---
app.use((req, res, next) => {
  console.log(`[DIAGNOSTIC] Incoming Request: ${req.method} ${req.url} from ${req.ip}`);
  next();
});
// --- END NEW DIAGNOSTIC LOGGING ---


// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (ensure no frontend serving is here)
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Routes
app.use("/api/users", authRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/admin", adminRoutes);

// Test endpoint
app.get('/test', (req, res) => {
  console.log('[DIAGNOSTIC] Hit /test endpoint!'); // Add this inside the route
  res.json({ message: 'API is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[DIAGNOSTIC] Error Middleware:', err.stack); // Add diagnostic to error handler
  res.status(500).json({ message: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    console.log(`[DIAGNOSTIC] Attempting to listen on port ${PORT}`); // More specific log
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  });