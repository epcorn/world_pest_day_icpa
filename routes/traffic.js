// In backend/routes/traffic.js

const express = require('express');
const router = express.Router();
const Visit = require('../models/Visit');

router.post('/track-visit', async (req, res) => {
  const { visitorId } = req.body;
  // Get today's date in YYYY-MM-DD format based on server's local time
  const today = new Date().toISOString().split('T')[0];

  if (!visitorId) {
    console.warn('[DIAGNOSTIC] track-visit request received without visitorId.');
    return res.status(400).json({ message: 'visitorId is required' });
  }

  try {
    // Attempt to find and update a visit record for this visitorId and today's date
    const result = await Visit.findOneAndUpdate(
      { visitorId: visitorId, dateVisited: today }, // Query: match visitorId AND dateVisited
      { $set: { timestamp: Date.now() } },           // Update: set/update the timestamp field
      { upsert: true, new: true, setDefaultsOnInsert: true } // Options: create if not found, return new doc, apply defaults
    );
    
    // Log the result of the Mongoose operation
    console.log('[DIAGNOSTIC] Visit findOneAndUpdate operation successful. Result:', result);
    
    res.status(200).json({ message: 'Visit tracked successfully' });

  } catch (error) {
    // --- CRITICAL: ENHANCED ERROR LOGGING ---
    if (error.code === 11000) { // MongoDB duplicate key error code
        console.warn(`[DIAGNOSTIC] Duplicate visit attempt for visitorId: ${visitorId} on ${today}. This is expected for multiple visits on the same day.`);
        return res.status(200).json({ message: 'Visit already tracked for this visitor today.' });
    }
    
    // Log the full error object for detailed debugging
    console.error('[DIAGNOSTIC] Full Error Object during visit tracking:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    // Log specific error properties for quick glance
    console.error('[DIAGNOSTIC] Error message:', error.message);
    console.error('[DIAGNOSTIC] Error name:', error.name);
    console.error('[DIAGNOSTIC] Error stack:', error.stack);

    res.status(500).json({ message: 'Failed to track visit due to internal server error. Check backend logs.' });
  }
});

// --- API Endpoint: /api/unique-visits (Uses visitorId for aggregation) ---
router.get('/unique-visits', async (req, res) => {
  try {
    // Count total unique visitors based on visitorId across all time
    const totalUniqueVisitorsResult = await Visit.aggregate([
      { $group: { _id: "$visitorId" } }, // Group documents by unique visitorId
      { $count: "count" }              // Count the number of such unique visitorIds
    ]);
    // The count will be in totalUniqueVisitorsResult[0].count if there are any results
    const totalUniqueVisitors = totalUniqueVisitorsResult.length > 0 ? totalUniqueVisitorsResult[0].count : 0;

    // Get today's date in YYYY-MM-DD format based on server's local time
    const today = new Date().toISOString().split('T')[0];
    
    // Count unique visitors for today.
    // Due to the compound unique index on { visitorId: 1, dateVisited: 1 },
    // `countDocuments({ dateVisited: today })` will effectively count each unique visitor once per day.
    const uniqueVisitorsToday = await Visit.countDocuments({ dateVisited: today });

    console.log(`[DIAGNOSTIC] Unique visitors today (${today}): ${uniqueVisitorsToday}`);
    console.log(`[DIAGNOSTIC] Total unique visitors: ${totalUniqueVisitors}`);

    res.status(200).json({
      totalUniqueVisitors: totalUniqueVisitors,
      uniqueVisitorsToday: uniqueVisitorsToday,
    });
  } catch (error) {
    console.error('[DIAGNOSTIC] Error fetching unique visit count:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    res.status(500).json({ message: 'Failed to fetch unique visit count due to internal server error.' });
  }
});

// --- API Endpoint: /api/unique-visits-daily ---
// This endpoint will fetch unique visitor counts for a specific date or a range.
router.get('/unique-visits-daily', async (req, res) => {
    const { date } = req.query; // Expecting 'date' query parameter: YYYY-MM-DD

    if (!date) {
        console.warn('[DIAGNOSTIC] unique-visits-daily request missing date parameter.');
        return res.status(400).json({ message: 'Date parameter is required.' });
    }

    try {
        // Find unique visitors for the specified date.
        // Again, due to the unique index, this counts unique visitorId entries for that specific date.
        const uniqueCount = await Visit.countDocuments({ dateVisited: date });

        console.log(`[DIAGNOSTIC] Unique visitors for date ${date}: ${uniqueCount}`);

        // For the chart, we need an array of objects like [{ date: "YYYY-MM-DD", count: N }]
        const dailyData = [{
            date: date,
            count: uniqueCount
        }];

        res.status(200).json(dailyData);
    } catch (error) {
        console.error('[DIAGNOSTIC] Error fetching daily unique visit count:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        res.status(500).json({ message: 'Failed to fetch daily unique visit count due to internal server error.' });
    }
});

module.exports = router;