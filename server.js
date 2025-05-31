const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const uploadRoute = require('./routes/uploadRoute');
const adminRoutes = require('./routes/adminRoute');

const app = express();

// Enhanced CORS configuration
// server.js - Revised CORS configuration
const corsOptions = {
  origin: 'https://world-pest-day-client.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin'],
  credentials: true,
  preflightContinue: false // Ensure preflight terminates
};

app.use(cors(corsOptions));

// Apply CORS globally


// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Routes
app.use("/api/users", authRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/admin", adminRoutes);

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  });