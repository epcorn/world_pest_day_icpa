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
    // Generate a 6-digit passcode
    const passcode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create or update user details in the database
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
      { new: true, upsert: true }, // Return updated doc; create if non-existent
    );

    // Return successful response to the frontend
    res.status(200).json({
      message:
        "Registration successful! Your 6-digit passcode has been generated.",
      user: {
        email: newUser.email,
        isVerified: newUser.isVerified,
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

router.post("/quiz/:email", async (req, res) => {
  let tempHtmlFilePath = null;

  try {
    const { email } = req.params;
    const { score } = req.query;

    const quizScore = score ? parseInt(score, 10) : 0;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    if (quizScore < 2) {
      return res.status(200).json({
        message: "Score too low. No certificate generated.",
        certificateUrl: null,
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const { name, passcode, companyName, mobile, annotation } = user;

    const issueDate = new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const userAnnotationPrefix = annotation ? `${annotation} ` : "";

    console.log(`[QUIZ] Generating Quiz Certificate for score: ${quizScore}`);
    const certificateHtml = generateQuizCertificateHTML(
      userAnnotationPrefix,
      name,
      companyName || "N/A",
      issueDate,
      quizScore,
    );

    const tempId = Math.random().toString(36).substring(7);
    tempHtmlFilePath = path.join(__dirname, `temp_quiz_cert_${tempId}.html`);
    await fs.promises.writeFile(tempHtmlFilePath, certificateHtml, "utf8");

    const safeFileName = `World_Pest_Day_Quiz_Certificate_${name.replace(/\s+/g, "_")}.pdf`;

    console.log("[QUIZ] Initiating HTML to PDF conversion...");
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

    const pdfFile = convertApiResult.files[0];
    if (!pdfFile || !pdfFile.url) {
      throw new Error("ConvertAPI did not return a valid PDF URL.");
    }
    const generatedPdfUrl = pdfFile.url;

    user.score = quizScore;
    user.quizCertificateUrl = generatedPdfUrl;
    await user.save();

    const token = jwt.sign(
      { name, companyName, email, mobile },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const baseUrl =
      process.env.BASE_URL || "https://wpdbackend-b47bcc7bc31a.herokuapp.com";
    const verifyLink = `${baseUrl}/api/users/verify?token=${token}`;

    const emailSubject =
      "Your World Pest Day Quiz Certificate & Contest Invitation";

    // ✅ Fetch PDF as buffer for reliable attachment
    console.log("[QUIZ] Fetching PDF buffer for email attachment...");
    // ✅ Fetch PDF buffer using built-in https — no axios needed
    const pdfBuffer = await new Promise((resolve, reject) => {
      const https = require("https");
      https
        .get(generatedPdfUrl, (response) => {
          const chunks = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () => resolve(Buffer.concat(chunks)));
          response.on("error", reject);
        })
        .on("error", reject);
    });

    const attachments = [
      {
        filename: safeFileName,
        content: pdfBuffer, // ✅ was pdfResponse.data
        contentType: "application/pdf",
      },
    ];

    await sendEmail(
      email,
      emailSubject,
      `
  <p>Congratulations, ${name},</p>
  <p>Thank you for participating in the World Pest Day Quiz and successfully completing it with a score of
    <strong>${quizScore}/3</strong>.
  </p>
  <p>Attached is your official Certificate, issued by the Indian Pest Control Association (IPCA), in recognition of your
    participation and achievement.</p>
    <a href="${user.quizCertificateUrl}">certificate Link </a>
  <p>Now that you've completed the quiz, we invite you to showcase your creativity and passion for the pest management
    industry by participating in our Photo and Video Contest.</p>
  <div>
    <strong>Contest Themes:</strong>
    <p>* Safety Practices in Pest Management</p>
    <p>* Public Awareness & Education</p>
    <p>* Social Contributions by the Pest Control Industry</p>
    <p>* Knowledge Sharing with Industry Peers</p>
  </div>
  <p>Please click the link below to verify your email address and submit your contest entry:</p>
  <p><a href="${verifyLink}"
      style="display:inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Verify
      Email Address</a></p>
  <p>Your unique 6-digit passcode for checking your video submission status is: <strong>${passcode}</strong></p>
  <p>Please keep this passcode safe. You will need it along with your email to view your video status on the landing page.</p>
  <p>We look forward to seeing your inspiring photos and videos. Exciting prizes await the winners!</p>
  <p>Thank you for supporting World Pest Day and helping promote a safer, healthier, and more informed community.</p>
  <p>verification link is valid for 1 hour.</p>
  <p>Best regards,<br><strong>Indian Pest Control Association <br>(IPCA)</strong></p>
      `,
      attachments,
    );

    console.log(
      "[QUIZ] Quiz certificate processed and email dispatched successfully.",
    );

    return res.status(200).json({
      message: "Quiz processed and certificate emailed successfully!",
      certificateUrl: generatedPdfUrl,
    });
  } catch (error) {
    console.error("[QUIZ ERROR]:", error);
    return res.status(500).json({
      message: "An error occurred while processing your quiz certificate.",
      error: error.message,
    });
  } finally {
    if (tempHtmlFilePath) {
      try {
        await fs.promises.unlink(tempHtmlFilePath);
        console.log(
          `[QUIZ] Cleaned up temporary HTML file: ${tempHtmlFilePath}`,
        );
      } catch (cleanupErr) {
        console.error(
          `[QUIZ ERROR] Failed to clean up temporary file:`,
          cleanupErr,
        );
      }
    }
  }
});

router.get("/runner", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Define strict year boundaries matching your frontend logic
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);
    const startOfPrevYear = new Date(`${currentYear - 1}-01-01T00:00:00.000Z`);
    const endOfPrevYear = new Date(`${currentYear - 1}-12-31T23:59:59.999Z`);

    // Let MongoDB aggregate the numbers on the database layer
    const stats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfPrevYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: null,
          // This Year Metrics
          thisYearJoined: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfYear] },
                    { $lte: ["$createdAt", endOfYear] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          thisYearCertificates: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfYear] },
                    { $lte: ["$createdAt", endOfYear] },
                    {
                      $and: [
                        { $ifNull: ["$certificateUrl", false] },
                        { $ne: ["$certificateUrl", ""] },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          thisYearVideos: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfYear] },
                    { $lte: ["$createdAt", endOfYear] },
                    { $ifNull: ["$videoUrl", false] },
                    { $ne: ["$videoUrl", ""] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          thisYearImages: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfPrevYear] },
                    { $lte: ["$createdAt", endOfPrevYear] },
                    { $ifNull: ["$imageUrl", false] }, // ✅ guards null/missing
                    { $ne: ["$imageUrl", ""] },
                  ],
                },
                1,
                0,
              ],
            },
          },

          // Last Year Metrics
          prevYearJoined: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfPrevYear] },
                    { $lte: ["$createdAt", endOfPrevYear] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          prevYearCertificates: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfPrevYear] },
                    { $lte: ["$createdAt", endOfPrevYear] },
                    {
                      $and: [
                        { $ifNull: ["$certificateUrl", false] },
                        { $ne: ["$certificateUrl", ""] },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          prevYearVideos: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfPrevYear] },
                    { $lte: ["$createdAt", endOfPrevYear] },
                    { $ne: ["$videoUrl", null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          prevYearImages: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfPrevYear] },
                    { $lte: ["$createdAt", endOfPrevYear] },
                    { $ne: ["$imageUrl", null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const data = stats[0] || {};

    // Standardize the response array structure to match your React state expectations
    return res.status(200).json([
      {
        certificateIssued: data.thisYearCertificates || 0,
        usersJoined: data.thisYearJoined || 0,
        videoUploaded: data.thisYearVideos || 0,
        imageUploaded: data.thisYearImages || 0,
      },
      {
        certificateIssued: data.prevYearCertificates || 0,
        usersJoined: data.prevYearJoined || 0,
        videoUploaded: data.prevYearVideos || 0,
        imageUploaded: data.prevYearImages || 0,
      },
    ]);
  } catch (error) {
    console.error("Runner aggregation error:", error);
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

    // ✅ Add this log to see what's actually in the token
    console.log("Decoded token:", decoded);

    // ✅ The quiz route signs with `email` from req.params, make sure it's lowercase
    const userEmail = (decoded.email || "").trim().toLowerCase();

    if (!userEmail) {
      return res.status(400).send("Token does not contain a valid email.");
    }

    const user = await User.findOne({ email: userEmail });
    console.log("Found user:", user); // ✅ Check if user is found

    if (!user) {
      return res.status(404).send("User not found for verification.");
    }

    const clientUrl = "https://wpd.webconnectipca.com";

    if (user.isVerified) {
      return res.redirect(`${clientUrl}/video-submission?verified=already`);
    }

    user.isVerified = true;
    await user.save();

    return res.redirect(`${clientUrl}/video-submission?verified=true`);
  } catch (err) {
    console.error("Verification Error:", err);
    if (err.name === "TokenExpiredError") {
      return res
        .status(400)
        .send("Verification link has expired. Please register again.");
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

    if (!user.isApproved) {
      user.isApproved = true;
      user.approvedAt = new Date();
      user.status = "approved";
      message = "User video approved and certificate emailed successfully.";
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

    // Always generate the General Participation Certificate
    console.log("[APPROVE] Generating General Participation Certificate");
    const certificateHtml = generateCertificateHTML(
      userAnnotationPrefix,
      user.name,
      user.companyName || "N/A",
      issueDate,
    );

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
    const safeFileName = `World_Pest_Day_Certificate_${user.name.replace(/\s+/g, "_")}.pdf`;

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

    // Persist the certificate URL to Mongoose
    certificateUrl = generatedPdfUrl;
    user.certificateUrl = certificateUrl;

    await user.save();
    console.log("[APPROVE] User document saved with new certificate URL.");

    console.log("[APPROVE] Initiating email sending...");
    const emailSubject = "Congratulations! Your World Pest Day Certificate";
    const emailHtml = `
            <h1>Congratulations, ${user.name}!</h1>
            <p>Your video submission has been approved.</p>
            <p>Attached is your official Certificate of Participation issued by the Indian Pest Control Association.</p>
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

    // Return the response
    res.status(200).json({
      message: message,
      certificateUrl: certificateUrl,
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

router.get("/singleUser/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }); // ✅ await not new
    if (!user) return res.status(404).json({ message: "User not found." });

    res.set("Cache-Control", "no-store");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
