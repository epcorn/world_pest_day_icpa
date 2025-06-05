// In backend/routes/traffic.js

const express = require('express');
const router = express.Router();
const Visit = require('../models/Visit');

// No longer needed as we're not primarily tracking IPs
// const getClientIp = (req) => {
//   const forwardedIpsStr = req.header('x-forwarded-for');
//   if (forwardedIpsStr) {
//     const forwardedIps = forwardedIpsStr.split(',');
//     return forwardedIps[0].trim();
//   }
//   return req.ip;
// };

// --- API Endpoint: /api/track-visit (CHANGED to POST and uses visitorId) ---
router.post('/track-visit', async (req, res) => {
  const { visitorId } = req.body; // Get visitorId from the request body
  const today = new Date().toISOString().split('T')[0];

  if (!visitorId) {
    return res.status(400).json({ message: 'visitorId is required' });
  }

  try {
    // Find or create a visit based on visitorId and dateVisited
    await Visit.findOneAndUpdate(
      { visitorId: visitorId, dateVisited: today }, // Query by visitorId
      { $set: { timestamp: Date.now() } }, // Update timestamp
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ message: 'Visit tracked successfully' });
  } catch (error) {
    // Handle potential duplicate key errors (from the unique index)
    if (error.code === 11000) {
        return res.status(200).json({ message: 'Visit already tracked for this visitor today.' });
    }
    console.error('Error tracking visit:', error);
    res.status(500).json({ message: 'Failed to track visit' });
  }
});

// --- API Endpoint: /api/unique-visits (Uses visitorId for aggregation) ---
router.get('/unique-visits', async (req, res) => {
  try {
    // Count total unique visitors based on visitorId
    const totalUniqueVisitorsResult = await Visit.aggregate([
      { $group: { _id: "$visitorId" } }, // Group by visitorId
      { $count: "count" }
    ]);
    const totalUniqueVisitors = totalUniqueVisitorsResult.length > 0 ? totalUniqueVisitorsResult[0].count : 0;

    // Count unique visitors for today based on visitorId and dateVisited
    const today = new Date().toISOString().split('T')[0];
    const uniqueVisitorsToday = await Visit.countDocuments({ dateVisited: today }); // This already counts unique documents for today, which means unique visitorId + dateVisited combinations.

    res.status(200).json({
      totalUniqueVisitors: totalUniqueVisitors,
      uniqueVisitorsToday: uniqueVisitorsToday,
    });
  } catch (error) {
    console.error('Error fetching unique visit count:', error);
    res.status(500).json({ message: 'Failed to fetch unique visit count' });
  }
});

// --- API Endpoint: /api/unique-visits-daily (Uses visitorId for aggregation) ---
router.get('/unique-visits-daily', async (req, res) => {
    const { date } = req.query; // Expecting 'date' query parameter: YYYY-MM-DD

    if (!date) {
        return res.status(400).json({ message: 'Date parameter is required.' });
    }

    try {
        // Find unique visitors for the specified date based on visitorId
        const uniqueCount = await Visit.countDocuments({ dateVisited: date });

        const dailyData = [{
            date: date,
            count: uniqueCount
        }];

        res.status(200).json(dailyData);
    } catch (error) {
        console.error('Error fetching daily unique visit count:', error);
        res.status(500).json({ message: 'Failed to fetch daily unique visit count' });
    }
});

module.exports = router;