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

// Middleware
app.use(cors());
app.use(express.json());

// 1. Serve static files from the 'Uploads' folder (e.g., for user-uploaded images)
// This should be one of the first static middleware to ensure direct access to uploads
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// 2. API Routes - These MUST come BEFORE any client-side static file serving
//    or the catch-all route for your frontend.
app.use("/api/users", authRoutes);
app.use("/api/upload", uploadRoute);
app.use('/api/admin', adminRoutes);

// 3. Serve static files from the React client's 'build' folder.
//    This serves your compiled React JS, CSS, images, etc.
//    It comes AFTER API routes because you want /api requests to hit your backend first.
app.use(express.static(path.join(__dirname, 'client/dist')));
// 4. Catch-all route to serve the React app's index.html for any unmatched routes.
//    This is crucial for client-side routing (e.g., React Router).
//    It MUST BE THE ABSOLUTE LAST ROUTE DEFINITION in your server.js.
app.get('/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});


// Port
const PORT = process.env.PORT || 5000;
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);


// MongoDB Connection (simplified as discussed, removing deprecated options)
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("✅ MongoDB connected");
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch((err) => {
  console.error("❌ DB Connection Error:", err);
});