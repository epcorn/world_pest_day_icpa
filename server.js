const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/auth");
const uploadRoute = require("./routes/uploadRoute");
const adminRoutes = require("./routes/adminRoute");

const app = express();

// --- Simplified CORS Setup: allow all origins ---
app.use(cors());
app.options("*", cors()); // Preflight for all routes

app.use(express.json());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// API routes
app.use("/api/users", authRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/admin", adminRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("World Pest Day API is running 🚀");
});

// Port
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
  });
