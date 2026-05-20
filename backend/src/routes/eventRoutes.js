const express = require('express');
const router = express.Router();
const Notification = require('../Models/Notification');
const Application = require('../Models/Application');
const User = require('../Models/User');
const Event = require('../Models/Event');
const mongoose = require('mongoose');
const Expo = require('../Models/Expo'); // Expo layout update karne ke liye


// 1. Create or Update Showcase (Dukan ka Maal Save Karein)
// Frontend handleSave() is route ko call karega
// routes/eventRoutes.js

router.put('/update-booth-content', async (req, res) => {
    try {
        const { expoId, boothId, boothDetails, exhibitorId } = req.body;

        // 1. Pehle "Event" collection (Showcase table) mein save/update karein
        const updatedEvent = await Event.findOneAndUpdate(
            { expoId: expoId, boothNumber: boothId },
            {
                exhibitorId,
                expoId,
                boothNumber: boothId,
                shopName: boothDetails.shopName,
                description: boothDetails.description,
                products: boothDetails.products,
                staff: boothDetails.staff,
                status: 'live'
            },
            { upsert: true, new: true }
        );

        // 2. ✅ CRITICAL STEP: Expo collection ke layout array mein data save karna
        // BoothSelection page yahin se data uthata hai
        const updatedExpo = await Expo.findOneAndUpdate(
            { 
                _id: expoId, 
                "booths.layout.id": boothId // Ye filter booth ko dhoondta hai
            },
            { 
                $set: { 
                   "booths.layout.$.boothDetails": boothDetails,
            "booths.layout.$.companyName": boothDetails.shopName,
            "booths.layout.$.exhibitorId": exhibitorId, // <--- Ye line confirm karegi ke neighbor ko data miley
            "booths.layout.$.status": "reserved"
                } 
            },
            { new: true }
        );

        if (!updatedExpo) {
            return res.status(404).json({ message: "Expo or Booth layout not found" });
        }

        res.status(200).json({ 
            message: "Success! Booth is now Active.", 
            event: updatedEvent,
            expo: updatedExpo 
        });

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});
// 2. Get Events for a specific Exhibitor (Table/Cards ke liye)
router.get('/my-events/:exhibitorId', async (req, res) => {
    try {
        // Populate expoId taake table mein Expo ka Title aur Date dikh sake
        const events = await Event.find({ exhibitorId: req.params.exhibitorId })
                                  .populate('expoId', 'title location startDate');
        
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: "Error fetching showcases", error: error.message });
    }
});

// 3. Delete Showcase
router.delete('/delete/:id', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Showcase deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting showcase", error });
    }
});
// 4. Update ONLY Staff (Staff Management Page ke liye)
router.put('/update-staff', async (req, res) => {
    try {
        const { exhibitorId, expoId, boothNumber, staff } = req.body;

        // Validation
        if (!exhibitorId || !expoId || !boothNumber) {
            return res.status(400).json({ message: "Missing required IDs (Exhibitor/Expo/Booth)" });
        }

        // 1. Find and Update the document
        const updatedEvent = await Event.findOneAndUpdate(
            { exhibitorId, expoId, boothNumber },
            { $set: { staff: staff } }, 
            { new: true, runValidators: true } // Validators zaroori hain enum ke liye
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: "Showcase not found" });
        }

        res.status(200).json({ message: "Staff updated successfully", staff: updatedEvent.staff });
    } catch (err) {
        console.error("Backend Error:", err.message);
        res.status(500).json({ message: "Database Error: " + err.message });
    }
});
// 3. Issue Staff Pass
router.put('/issue-pass', async (req, res) => {
    const { eventId, staffEmail } = req.body;
    // Event model mein us staff member ka 'isPassIssued' true kar dein
});
// Admin ke liye: Saari dukanon (showcases) ka data aur unka staff uthao
router.get('/all-showcases', async (req, res) => {
    try {
        // Find all events and populate expo details
        const showcases = await Event.find().populate('expoId', 'title');
        res.status(200).json(showcases);
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
});

// ISSUE STAFF PASS
router.put('/issue-staff-pass', async (req, res) => {
    try {
        const { eventId, staffEmail } = req.body;
        
        // 1. Update Pass Status in Database
        const updatedEvent = await Event.findOneAndUpdate(
            { _id: eventId, "staff.email": staffEmail },
            { $set: { "staff.$.isPassIssued": true, "staff.$.passId": "PASS-" + Math.random().toString(36).substr(2, 9).toUpperCase() } },
            { new: true }
        ).populate('exhibitorId');

        if (!updatedEvent) return res.status(404).json({ message: "Staff not found" });

        // 🟢 Get staff member name for the message
        const staffMember = updatedEvent.staff.find(s => s.email === staffEmail);

   await Notification.create({
    recipient: 'exhibitor',
    recipientId: updatedEvent.exhibitorId._id, // Explicitly use ._id
    message: `Pass Issued: Staff pass for ${staffMember.name} is ready.`,
    type: 'pass'
});

        res.status(200).json({ message: "Pass issued successfully!", updatedEvent });
    } catch (error) {
        res.status(500).json({ message: "Error issuing pass", error: error.message });
    }
});
// Check for upcoming events and create notifications
router.get("/check-upcoming-events", async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Wo events dhoondo jo kal start ho rahe hain
    const upcomingExpos = await Expo.find({
      startDate: { $lte: tomorrow, $gte: new Date() }
    });

    for (let expo of upcomingExpos) {
      // Check if notification already sent to avoid duplicates
      const exists = await Notification.findOne({ 
        message: { $regex: expo.title }, 
        type: 'reminder' 
      });

      if (!exists) {
        await Notification.create({
          recipient: 'all',
          message: `Reminder: The event "${expo.title}" starts tomorrow! Prepare your booth.`,
          type: 'reminder'
        });
      }
    }
    res.json({ message: "Reminders checked" });
  } catch (err) { res.status(500).json(err); }
});
// routes/eventRoutes.js mein add karein

// router.get('/event-analytics/:exhibitorId', async (req, res) => {
//     try {
//         const { exhibitorId } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(exhibitorId)) {
//             return res.status(400).json({ message: "Invalid Exhibitor ID" });
//         }

//         // Exhibitor ke saare active booths (Events) nikaalein
//         const showcases = await Event.find({ 
//             exhibitorId: new mongoose.Types.ObjectId(exhibitorId) 
//         }).populate('expoId', 'title');

//         if (showcases.length === 0) {
//             return res.status(200).json([]); // Khali array bhejein agar booth set nahi kiya
//         }

//         const analyticsData = showcases.map(item => ({
//             id: item._id,
//             expoName: item.expoId?.title || "Unknown Expo",
//             // Agar aapke pas real leads/queries nahi hain toh 0 dikhayein
//             leads: item.leads || 0, 
//             queries: item.queries || 0,
//             status: item.status
//         }));

//         res.status(200).json(analyticsData);
//     } catch (error) {
//         console.error("Analytics Error:", error);
//         res.status(500).json({ message: error.message });
//     }
// });
// routes/eventRoutes.js (Analytics fix)

// routes/eventRoutes.js mein purana analytics hata kar ye dalein:

router.get('/event-analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Wo Expos dhoondo jahan ye exhibitor maujood hai
    const expos = await Expo.find({
      "booths.layout.exhibitorId": userId
    });

    const analytics = [];

    expos.forEach(e => {
      e.booths.layout.forEach(booth => {
        // Booth ka owner check karein
        if (booth.exhibitorId && booth.exhibitorId.toString() === userId) {
          analytics.push({
            boothId: booth.id,
            leads:   booth.boothDetails?.leads   || 0,
            queries: booth.boothDetails?.queries || 0,
            views:   booth.boothDetails?.views   || 0,
            expoTitle: e.title
          });
        }
      });
    });

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;