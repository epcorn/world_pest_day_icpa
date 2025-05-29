const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: { type: String },
  email: { type: String, required: true, unique: true },
  mobile: { type: String },

  isVerified: { type: Boolean, default: false },

  verificationSentAt: { type: Date, default: null },       // When the first verification email was sent
  lastReminderSentAt: { type: Date, default: null },        // Last time a reminder was sent

  videoUrl: { type: String, default: null },
  videoUploadedAt: { type: Date, default: null },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },

  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  approvedAt: { type: Date, default: null },

  certificateUrl: { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
