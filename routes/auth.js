// routes/users.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken"); // Import jsonwebtoken
const User = require("../models/User"); // Adjust path as necessary
const generateCertificateHTML = require("./certificateTemplate");
const generateQuizCertificateHTML = require("./quizCertificateTemplate");
const sendEmail = require("../utils/sendEmail"); // Import sendEmail utility
const fs = require("fs"); // Re-added for temporary file operations
const path = require("path"); // Re-added for path manipulation

const ConvertAPI = require("convertapi");
const sendCertificateEmail = require("../utils/sendCertificateEmail");
const convertapi = new ConvertAPI(process.env.CONVERTAPI_SECRET);

// POST /api/users/register
// Registers a new user, sends verification email, and provides a passcode
router.post("/register", async (req, res) => {
  const { annotation, name, companyName, email, mobile } = req.body;

  try {
    // Validate input
    if (!email || !name || !companyName || !mobile || !annotation) {
      // Ensure annotation is also checked
      return res.status(400).json({
        message:
          "All fields (annotation, name, company, email, mobile) are required.",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    // Check for existing user (regardless of verification status)
    const existingUser = await User.findOne({ email });
    // Generate a 6-digit passcode
    const passcode = Math.floor(100000 + Math.random() * 900000).toString(); // Ensures 6 digits

    // Create verification token (for email verification)
    const token = jwt.sign(
      { name, companyName, email, mobile },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }, // Token expires in 1 hour
    );

    // Verification link
    const verifyLink = `${process.env.BASE_URL || "https://wpdbackend-b47bcc7bc31a.herokuapp.com"}/api/users/verify?token=${token}`;

    // Send verification email with passcode
    await sendEmail(
      email,
      "Verify Your World Pest Day Registration & Get Your Passcode",
      `
            <p>Dear ${name},</p>
            <p>Thank you for registering for World Pest Day!</p>
            <p>Please verify your email by clicking this link: <a href="${verifyLink}">Verify Email Address</a></p>
            <p>Your unique 6-digit passcode for checking your video submission status is: <strong>${passcode}</strong></p>
            <p>Please keep this passcode safe. You will need it along with your email to view your video status on the landing page.</p>
            <p>Best regards,<br>The World Pest Day Team</p>
            `,
    );
    // Create or update user
    const newUser = await User.findOneAndUpdate(
      { email: email.trim().toLowerCase() }, // Query criteria
      {
        annotation,
        name: name.trim(),
        companyName,
        mobile,
        isVerified: false,
        verificationSentAt: new Date(),
        lastReminderSentAt: new Date(),
        passcode: passcode,
        status: "pending",
      },
      { new: true, upsert: true }, // 'new' returns the updated doc; 'upsert' creates it if it doesn't exist
    );

    res.status(200).json({
      message:
        "Registration successful! A verification email with your 6-digit passcode has been sent. Please check your inbox.",
      user: {
        email: newUser.email,
        isVerified: newUser.isVerified,
        // Do NOT send the passcode in this response for security reasons,
        // as it's already sent via email. The frontend will assume it's sent.
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    // Handle Mongoose duplicate key error specifically
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({
        message:
          'Email already registered. Please use the "Check Status" option with your email and passcode.',
      });
    }
    res.status(500).json({
      message: "Server error during registration. Please try again later.",
    });
  }
});

router.get("/runner", async (req, res) => {
  try {
    const users = await User.find().select("-mobile -email -passcode");

    if (!users) return res.status(400).json({ msg: "users not found" });

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/users/check
// This route now exclusively handles status checks using email and passcode.
router.post("/check", async (req, res) => {
  const { email, passcode } = req.body; // Expecting email and passcode

  if (!email || !passcode) {
    return res.status(400).json({
      message: "Email and 6-digit passcode are required to check status.",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Do not reveal if email exists or not for security
      return res
        .status(404)
        .json({ message: "No matching user found or invalid credentials." });
    }

    // Simple string comparison for passcode (as requested, no bcrypt)
    if (user.passcode !== passcode) {
      return res.status(401).json({ message: "Invalid passcode." });
    }

    // If email and passcode match, return the user details for frontend display
    // Only return necessary fields to the frontend for security and efficiency
    res.status(200).json({
      annotation: user.annotation,
      name: user.name,
      companyName: user.companyName,
      email: user.email,
      mobile: user.mobile,
      isVerified: user.isVerified,
      videoUrl: user.videoUrl,
      imageUrl: user.imageUrl,
      videoUploadedAt: user.videoUploadedAt,
      status: user.status, // 'pending', 'approved', 'rejected'
      isApproved: user.isApproved,
      approvedBy: user.approvedBy,
      approvedAt: user.approvedAt,
      certificateUrl: user.certificateUrl,
      createdAt: user.createdAt,
      // DO NOT return the passcode here for security
    });
  } catch (error) {
    console.error("Error in /check (status check):", error);
    res.status(500).json({ message: "Server error during status check." });
  }
});

// GET /api/users/verify
// Handles email verification clicks from the link sent during registration.
router.get("/verify", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Verification token is required.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      // If user somehow doesn't exist by email, but token is valid, it's an edge case.
      // You might want to handle this differently, e.g., redirect to registration.
      return res.status(404).send("User not found for verification.");
    }

    if (user.isVerified) {
      return res.status(200).send("Email already verified.");
    }

    user.isVerified = true;
    await user.save();

    return res.send("Email verified successfully.");
  } catch (err) {
    console.error("Verification Error:", err);
    if (err.name === "TokenExpiredError") {
      return res
        .status(400)
        .send(
          "Verification link has expired. Please register again to get a new link and passcode.",
        );
    }
    return res.status(400).send("Invalid verification token.");
  }
});
// @route GET /api/upload/users/video?email=...
// This endpoint is for fetching user video *data* (metadata), not the stream.
// This route is fine here as it's directly related to the upload process.
router.get("/video", async (req, res) => {
  console.log("Requested user video data for email:", req.query.email);
  const email = req.query.email;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email query parameter is required." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json(null);
    }
    res.status(200).json(user);
    console.log(user);
  } catch (error) {
    console.error("Error fetching user video data:", error);
    res.status(500).json({ message: "Server error fetching video data." });
  }
});


router.post("/approve/:userId", async (req, res) => {
  let tempHtmlFilePath = null; // Declare outside try block for cleanup in catch
  try {
    console.log(`[APPROVE] Request received for userId: ${req.params.userId}`);

    // Extract and sanitize score parameter from query string
    const quizScore = req?.query?.score ? parseInt(req?.query?.score, 10) : 0;

    // 1. BACKEND PROTECTION ACCORDING TO REQUIREMENTS:
    // Prevent system approvals if the score doesn't meet passing criteria (minimum 2/3)
    // if (isNaN(quizScore) || quizScore < 2) {
    //   console.warn(
    //     `[APPROVE REJECTED] User ${req.params.userId} attempted approval with failing score: ${req?.query?.score}`,
    //   );
    //   return res.status(400).json({
    //     message:
    //       "Quiz approval failed. You must answer at least 2 out of 3 questions correctly.",
    //   });
    // }

    const user = await User.findById(req.params.userId);
    if (!user) {
      console.warn(`[APPROVE] User not found: ${req.params.userId}`);
      return res.status(404).json({ message: "User not found" });
    }
    console.log(
      `[APPROVE] User found: ${user.email}, isApproved: ${user.isApproved}`,
    );

    let message = "Certificate re-sent successfully.";
    let certificateUrl = user.certificateUrl; // Initialize with existing URL if any
    let quizCertificateUrl = user.quizCertificateUrl; // Initialize with existing URL if any

    if (!user.isApproved) {
      user.isApproved = true;
      user.score = quizScore; // Stored securely as a validated Number integer
      user.approvedAt = new Date();
      user.status = "approved";
      message = "User video approved and quiz certificate emailed successfully.";
      console.log("[APPROVE] User status changed to approved.");
    } else {
      console.log("[APPROVE] User already approved. Resending certificate.");
    }

    const issueDate = new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const userAnnotationPrefix = user.annotation ? `${user.annotation} ` : "";

    // 2. FIXED HTML GENERATION LOGIC
    // Since quizScore is guaranteed to be >= 2 due to the guard clause above,
    // it will generate the Quiz Certificate. 
    let certificateHtml;
    if (quizScore && quizScore >= 2) {
      console.log(`[APPROVE] Generating Quiz Certificate for score: ${quizScore}`);
      certificateHtml = generateQuizCertificateHTML(
        userAnnotationPrefix,
        user.name,
        user.companyName || "N/A",
        issueDate,
        quizScore // Added parameter in case your template displays the actual score
      );
    } else {
      console.log("[APPROVE] Generating General Participation Certificate");
      certificateHtml = generateCertificateHTML(
        userAnnotationPrefix,
        user.name,
        user.companyName || "N/A",
        issueDate,
      );
    }

    console.log(
      "[APPROVE] Certificate HTML generated (first 500 chars):",
      certificateHtml.substring(0, 500),
    );

    console.log("[ConvertAPI] Initiating HTML to PDF conversion...");

    // Create a temporary HTML file securely
    tempHtmlFilePath = path.join(
      __dirname,
      `temp_certificate_${user._id}.html`,
    );
    console.log(`[APPROVE] Writing temporary HTML to: ${tempHtmlFilePath}`);
    await fs.promises.writeFile(tempHtmlFilePath, certificateHtml, "utf8");

    // Clean space formatting for cross-platform PDF file naming compatibility
    const safeFileName = `World_Pest_Day_Quiz_Certificate_${user.name.replace(/\s+/g, "_")}.pdf`;

    // Convert the temporary HTML file to PDF using ConvertAPI
    const convertApiResult = await convertapi.convert(
      "pdf",
      {
        File: tempHtmlFilePath,
        FileName: safeFileName,
        PageOrientation: "landscape",
        PageSize: "A4",
        MarginTop: 0,
        MarginBottom: 0,
        MarginLeft: 0,
        MarginRight: 0,
        Scale: 90,
      },
      "html",
    );

    console.log("[APPROVE] ConvertAPI conversion successful.");

    // Get the URL of the generated PDF
    const pdfFile = convertApiResult.files[0];
    if (!pdfFile || !pdfFile.url) {
      console.error(
        "[APPROVE ERROR] ConvertAPI did not return a valid PDF URL. Result:",
        JSON.stringify(convertApiResult),
      );
      throw new Error("ConvertAPI did not return a valid PDF URL.");
    }
    
    const generatedPdfUrl = pdfFile.url;

    // 3. PERSISTING THE RIGHT URL FIELD TO MONGOOSE
    if (quizScore && quizScore >= 2) {
      quizCertificateUrl = generatedPdfUrl;
      user.quizCertificateUrl = quizCertificateUrl;
    } else {
      certificateUrl = generatedPdfUrl;
      user.certificateUrl = certificateUrl;
    }

    await user.save();
    console.log("[APPROVE] User document saved with new certificate URL(s).");

    console.log("[APPROVE] Initiating email sending...");
    const emailSubject = "Congratulations! Your World Pest Day Quiz Certificate";
    const emailHtml = `
            <h1>Congratulations, ${user.name}!</h1>
            <p>Thank you for passing the World Pest Day Quiz with a score of **${quizScore}/3**!</p>
            <p>Attached is your official Certificate of Excellence issued by the Indian Pest Control Association.</p>
            <p>You can also download it directly from this link: <a href="${generatedPdfUrl}">${generatedPdfUrl}</a></p>
            <p>Best regards,<br>Indian Pest Control Association</p>
        `;
    const attachments = [
      {
        filename: safeFileName,
        href: generatedPdfUrl,
        contentType: "application/pdf",
      },
    ];

    await sendCertificateEmail(
      user.email,
      emailSubject,
      emailHtml,
      attachments,
    );
    console.log("[APPROVE] Certificate email sent successfully.");

    // Return the appropriate URL variant in the JSON payload response
    res.status(200).json({ 
      message: message, 
      certificateUrl: quizScore >= 2 ? quizCertificateUrl : certificateUrl 
    });

  } catch (err) {
    console.error(
      "[APPROVE ERROR] Error approving user or generating certificate:",
      err,
    );
    if (err.response && err.response.data) {
      console.error(
        "[APPROVE ERROR] ConvertAPI/Axios Error Details:",
        err.response.data,
      );
    }
    if (err.name === "MongooseError" || err.name === "ValidationError") {
      console.error("[APPROVE ERROR] Mongoose specific error:", err.message);
    }
    res.status(500).json({
      message: "Server error during certificate generation or email sending.",
      error: err.message,
    });
  } finally {
    // Ensure temporary file is deleted even if errors occur
    if (tempHtmlFilePath) {
      try {
        await fs.promises.unlink(tempHtmlFilePath);
        console.log(
          `[APPROVE] Cleaned up temporary HTML file: ${tempHtmlFilePath}`,
        );
      } catch (cleanupErr) {
        console.error(
          `[APPROVE ERROR] Failed to clean up temporary HTML file ${tempHtmlFilePath}:`,
          cleanupErr,
        );
      }
    }
  }
});

module.exports = router;
