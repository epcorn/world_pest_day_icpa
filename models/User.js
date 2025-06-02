const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    annotation: { type: String, enum: ['Mr','Mrs','Ms', 'Dr', 'Dr.HC'], default: 'Mr' },
    name: { type: String, required: true },
    companyName: { type: String },
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    isVerified: { type: Boolean, default: false }, // For email verification
    verificationSentAt: { type: Date, default: null },
    lastReminderSentAt: { type: Date, default: null },
    videoUrl: { type: String, default: null },
    publicId: { type: String, default: null }, // Important for Cloudinary management if you added it previously
    videoUploadedAt: { type: Date, default: null },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    isApproved: { type: Boolean, default: false }, // For video approval state
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    approvedAt: { type: Date, default: null },
    certificateUrl: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    // --- NEW FIELD: passcode ---
    passcode: {
        type: String,
        required: false, // It will be set upon registration
        minlength: 6,
        maxlength: 6,
        // You could add match: /^\d{6}$/ if you want to ensure it's digits only, but String is fine.
    },
});

module.exports = mongoose.model('User', userSchema);