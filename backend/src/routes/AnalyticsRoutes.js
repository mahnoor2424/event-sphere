const express = require("express");
const router = express.Router();
const Expo = require("../Models/Expo");
const Schedule = require("../Models/Schedule");
const User = require("../models/User");
const Registration = require("../Models/Registration");

// 1. PURANA ROUTE (Summary Stats ke liye)
router.get("/summary", async (req, res) => {
  try {
    const totalExpos = await Expo.countDocuments();
    const totalSessions = await Schedule.countDocuments();
    const totalExhibitors = await User.countDocuments({ role: "exhibitor" });

    const sessionDistribution = await Schedule.aggregate([
      { $group: { _id: "$expoId", sessionCount: { $sum: 1 } } }
    ]);

    res.json({
      stats: { totalExpos, totalSessions, totalExhibitors },
      sessionDistribution
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/detailed-reports", async (req, res) => {
  try {
    const expos = await Expo.find();
    const totalPlatformAttendees = await User.countDocuments({ role: 'attendee' });
    
    let totalExhibitorsAll = 0;
    let totalCapacityAll = 0;

    const detailedExpos = await Promise.all(expos.map(async (expo) => {
      
      // 1. ATTENDEE ENGAGEMENT (Kitne logon ne register kiya is expo ke liye)
      const attendeeCount = await Registration.countDocuments({ expoId: expo._id });

      // 2. SESSION POPULARITY (Is expo ke sessions par kitne bookmarks hain)
      const sessions = await Schedule.find({ expoId: expo._id });
      const totalBookmarks = sessions.reduce((acc, s) => acc + (s.bookmarks || 0), 0);
      
      // Find top session name
      const topSession = sessions.sort((a,b) => (b.bookmarks || 0) - (a.bookmarks || 0))[0];

      // 3. BOOTH OCCUPANCY (Layout se booked booths nikalna)
      const total = expo.booths?.total || 0;
      const reserved = total - (expo.booths?.available || 0);
      
      totalExhibitorsAll += reserved;
      totalCapacityAll += total;

      return {
        _id: expo._id,
        title: expo.title,
        location: typeof expo.location === 'object' ? (expo.location.city || expo.location.venue) : expo.location,
        attendees: attendeeCount, 
        popularSession: topSession ? topSession.title : "No Active Sessions",
        bookmarksCount: totalBookmarks, 
        exhibitorCount: reserved,
        totalCapacity: total
      };
    }));

    const avgOccupancy = totalCapacityAll > 0 ? Math.round((totalExhibitorsAll / totalCapacityAll) * 100) : 0;

    res.json({
      expos: detailedExpos,
      summary: {
        totalGlobalAttendees: totalPlatformAttendees,
        avgOccupancy,
        totalEvents: expos.length
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Analytics Error: " + err.message });
  }
});
module.exports = router;