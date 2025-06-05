const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  // Stores the client's IP address
  ipAddress: {
    type: String,
    required: true,
  },
  // Stores the date of the visit as a string (e.g., "2025-06-05")
  // This allows us to easily track unique visits per day.
  dateVisited: {
    type: String,
    required: true,
  },
  // Stores the exact time of the visit. Defaults to the current time.
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound unique index. This is crucial!
// It ensures that for any given day, an IP address can only be recorded once.
// If the same IP visits multiple times on the same day, only the 'timestamp' will be updated.
visitSchema.index({ ipAddress: 1, dateVisited: 1 }, { unique: true });

module.exports = mongoose.model('Visit', visitSchema);