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

app.use(cors());
app.use(express.json());

// Serve static files from 'Uploads'
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// API Routes
app.use("/api/users", authRoutes); // authRoutes also uses cors(corsOptions) internally now
app.use("/api/upload", uploadRoute);
app.use('/api/admin', adminRoutes);

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Port
const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("✅ MongoDB connected");
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch((err) => {
  console.error("❌ DB Connection Error:", err);
});