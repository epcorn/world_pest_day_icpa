const express = require('express');
const router = express.Router();
const Visit = require('../models/Visit');

const getClientIp = (req) => {
  const forwardedIpsStr = req.header('x-forwarded-for');
  if (forwardedIpsStr) {
    const forwardedIps = forwardedIpsStr.split(',');
    return forwardedIps[0].trim();
  }
  return req.ip;
};

// --- API Endpoint: /api/track-visit (No change) ---
router.get('/track-visit', async (req, res) => {
  const ip = getClientIp(req);
  const today = new Date().toISOString().split('T')[0];

  try {
    await Visit.findOneAndUpdate(
      { ipAddress: ip, dateVisited: today },
      { $set: { timestamp: Date.now() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ message: 'Visit tracked successfully' });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ message: 'Failed to track visit' });
  }
});

// --- API Endpoint: /api/unique-visits (No change) ---
router.get('/unique-visits', async (req, res) => {
  try {
    const totalUniqueVisitorsResult = await Visit.aggregate([
        { $group: { _id: "$ipAddress" } },
        { $count: "count" }
    ]);
    const totalUniqueVisitors = totalUniqueVisitorsResult.length > 0 ? totalUniqueVisitorsResult[0].count : 0;

    const today = new Date().toISOString().split('T')[0];
    const uniqueVisitorsToday = await Visit.countDocuments({ dateVisited: today });

    res.status(200).json({
      totalUniqueVisitors: totalUniqueVisitors,
      uniqueVisitorsToday: uniqueVisitorsToday,
    });
  } catch (error) {
    console.error('Error fetching unique visit count:', error);
    res.status(500).json({ message: 'Failed to fetch unique visit count' });
  }
});

// --- NEW API Endpoint: /api/unique-visits-daily ---
// This endpoint will fetch unique visitor counts for a specific date or a range.
router.get('/unique-visits-daily', async (req, res) => {
    const { date } = req.query; // Expecting 'date' query parameter: YYYY-MM-DD

    if (!date) {
        return res.status(400).json({ message: 'Date parameter is required.' });
    }

    try {
        // Find unique visitors for the specified date
        // In a real-world scenario, you might want to fetch for a range (e.g., last 7 days)
        // to populate a chart with multiple bars. For this request, we'll return data for one day.
        const uniqueCount = await Visit.countDocuments({ dateVisited: date });

        // For the chart, we need an array of objects like [{ date: "YYYY-MM-DD", count: N }]
        // If you want to show a range, you'd perform an aggregation over a date range.
        // For simplicity, I'm returning an array with just the requested date's data.
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