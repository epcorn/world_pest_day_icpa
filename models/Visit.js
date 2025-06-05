// In backend/models/Visit.js

const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  // Changed from ipAddress to visitorId for browser-based tracking
  visitorId: {
    type: String,
    required: true,
    // You might want to add an index for faster lookups, but unique: true
    // is often not desired here if a user can visit multiple times on the same day.
    // The combination of visitorId and dateVisited will ensure daily uniqueness.
  },
  dateVisited: {
    type: String, // YYYY-MM-DD format
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Add a compound unique index to ensure one unique visit per visitorId per day
visitSchema.index({ visitorId: 1, dateVisited: 1 }, { unique: true });

const Visit = mongoose.model('Visit', visitSchema);

module.exports = Visit;