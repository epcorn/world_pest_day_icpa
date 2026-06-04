const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2; // Import Cloudinary v2
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // Import CloudinaryStorage
const User = require("../models/User"); // Ensure this path is correct

const router = express.Router();

// --- Cloudinary Configuration ---
// Make sure these environment variables are set in your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Multer-Storage-Cloudinary Configuration ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype.startsWith("image/");
    return {
      folder: "wpd_videos", // Specify a folder in Cloudinary for your videos
      resource_type: "auto", // Set resource type to 'video'
      allowed_formats: isImage
        ? ["jpg", "jpeg", "png", "webp"]
        : ["mp4", "mov", "avi", "mkv", "webm"], // Specify allowed video formats
      // You can add more transformations here if needed, e.g., eager: [{ width: 300, height: 300, crop: "pad" }]
    };
  },
});

const upload = multer({
  storage: storage,
  // Keep this at 100MB as a global fallback/maximum guardrail
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Define explicit limits in bytes
    const maxVideoSize = 100 * 1024 * 1024; // 100 MB
    const maxImageSize = 10 * 1024 * 1024; // 10 MB (Adjust this number as needed)

    // Read the incoming file's size from the headers (provided by busboy)
    const fileSize = parseInt(req.headers["content-length"]);

    if (file.mimetype.startsWith("video/")) {
      // Validate video size if header data is reliable
      if (fileSize && fileSize > maxVideoSize) {
        return cb(
          new Error("Video file is too large! Maximum limit is 100MB."),
          false,
        );
      }
      cb(null, true);
    } else if (file.mimetype.startsWith("image/")) {
      // Validate image size
      if (fileSize && fileSize > maxImageSize) {
        return cb(
          new Error("Image file is too large! Maximum limit is 10MB."),
          false,
        );
      }
      cb(null, true);
    } else {
      cb(new Error("Only video and image files are allowed!"), false);
    }
  },
});

// @route POST /api/upload?email=...
// This route now uploads video directly to Cloudinary
// Note: 'upload.single('video')' still handles the incoming multipart field name,
// but the file itself can now be an image or a video.
// Note: 'upload.single('video')' still handles the incoming multipart field name,
// but the file itself can now be an image or a video.
router.post("/", upload.single("video"), async (req, res) => {
  try {
    const email = req.query.email;

    // Dynamically get resource type ('video' or 'image') or fallback to 'auto'
    const resourceType =
      req.file && req.file.mimetype
        ? req.file.mimetype.startsWith("image/")
          ? "image"
          : "video"
        : "auto";

    if (!email) {
      // If email is missing, and a file was uploaded, delete it from Cloudinary
      if (req.file && req.file.public_id) {
        await cloudinary.uploader.destroy(req.file.public_id, {
          resource_type: resourceType,
        });
      }
      return res.status(400).json({ message: "Email query param is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // If user not found, and a file was uploaded, delete it from Cloudinary
      if (req.file && req.file.public_id) {
        await cloudinary.uploader.destroy(req.file.public_id, {
          resource_type: resourceType,
        });
      }
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // `req.file.path` contains the Cloudinary secure URL after successful upload
    const fileUrl = req.file.path; // This is the secure_url from Cloudinary
    const publicId = req.file.public_id; // Store public_id to allow deletion/management later

    // If a file already exists for this user, delete the old one from Cloudinary
    // Checks both user.publicId or your historical field if applicable
    if (user.publicId) {
      try {
        // Using 'auto' here so Cloudinary finds and deletes either the old image or video safely
        await cloudinary.uploader.destroy(user.publicId, {
          resource_type: "auto",
        });
        console.log(
          `Old media with public_id ${user.publicId} deleted from Cloudinary.`,
        );
      } catch (deleteError) {
        console.warn(
          `Could not delete old media with public_id ${user.publicId}:`,
          deleteError.message,
        );
        // Continue despite deletion error to update with new video
      }
    }

    // --- NEW CONDITIONAL ASSIGNMENT HERE ---
    if (resourceType === "image") {
      user.imageUrl = fileUrl;
      // Optionally clear the old video if a user switches asset types
      user.videoUrl = null;
    } else {
      user.videoUrl = fileUrl;
      // Optionally clear the old image if a user switches asset types
      user.imageUrl = null;
    }

    user.publicId = publicId; // Save the Cloudinary public_id
    user.videoUploadedAt = new Date(); // You might want to track this
    user.isApproved = false; // Reset approval status if a new video is uploaded
    user.approvedBy = null;
    user.approvedAt = null;
    user.annotation = user.annotation || ""; // Ensure annotation is not lost on re-upload

    // --- IMPORTANT CHANGE HERE: Set status to 'pending' instead of 'submitted' ---
    user.status = "pending"; // Changed from 'submitted' to 'pending' as per enum

    await user.save();
    // Return the entire user object, which now includes the updated videoUrl
    res.status(200).json(user);
  } catch (err) {
    console.error("Upload Error:", err);
    // If an error occurs during processing (e.g., DB save failure),
    // and a file was already uploaded to Cloudinary, delete it.
    if (req.file && req.file.public_id) {
      try {
        const resourceType = req.file.mimetype
          ? req.file.mimetype.startsWith("image/")
            ? "image"
            : "video"
          : "auto";
        await cloudinary.uploader.destroy(req.file.public_id, {
          resource_type: resourceType,
        });
        console.log(
          `Uploaded file with public_id ${req.file.public_id} deleted due to upload error.`,
        );
      } catch (deleteError) {
        console.error(
          "Error deleting failed Cloudinary upload:",
          deleteError.message,
        );
      }
    }
    res.status(500).json({ message: err.message || "File upload failed" });
  }
});

// --- REMOVED: Local video streaming route ---
// router.get('/uploads/videos/:filename', ...);
// This route is no longer needed as videos are streamed directly from Cloudinary.

module.exports = router;
