const express = require("express");
const router = express.Router();
const Meeting = require("../Models/Meeting");
const Notification = require("../Models/Notification");
const Event = require("../Models/Event"); // Aapki dukan ka model
const User = require("../Models/User");
const Expo = require("../Models/Expo");
const mongoose = require("mongoose");

// 1. POST: Meeting Book Karna (Attendee Side)
router.post("/book", async (req, res) => {
  try {
    const { userId, shopId, expoId, date, time, note } = req.body;

    if (!userId || !shopId || !expoId) {
      return res.status(400).json({ message: "Required IDs are missing" });
    }

    // ✅ PEHLE data fetch karo
    const shop = await Event.findById(shopId);
    const attendee = await User.findById(userId);
    const expoData = await Expo.findById(expoId);

    // ✅ PHIR meeting save karo
    const newMeeting = new Meeting({
      attendeeId: userId,
      exhibitorId: shopId,
      expoId: expoId,
      date, time, note,
      status: "pending"
    });
    await newMeeting.save();

    // ✅ AB notification bhejo (shop already defined hai upar)
    if (shop && attendee) {
      await Notification.create({
        recipient: 'exhibitor',
        recipientId: shop.exhibitorId,
        message: `New Meeting Request: ${attendee.name} wants to meet on ${date} at ${time} for "${expoData?.title}".`,
        type: 'meeting',
        link: '/exhibitor/appointments'
      });
      console.log("🔔 Notification Sent to Exhibitor");
    }

    res.status(201).json({ message: "Meeting request sent successfully!", data: newMeeting });

  } catch (error) {
    console.error("❌ Booking Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
// 2. GET: Exhibitor apni requests dekhe (Exhibitor Side)
router.get("/exhibitor/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // A. Pehle dhoondein ke is Exhibitor ki dukan (Event) kaunsi hai
    const myShops = await Event.find({ exhibitorId: userId });
    
    if (!myShops || myShops.length === 0) {
      return res.json([]); 
    }

    // B. Dukan ki IDs nikalen
    const shopIds = myShops.map(shop => shop._id);

    // C. Meeting table mein wo meetings dhoondein jo in dukanon ke liye hain
    const meetings = await Meeting.find({ exhibitorId: { $in: shopIds } })
      .populate("attendeeId", "name email")
      .populate("expoId", "title")
      .sort({ createdAt: -1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET: Attendee apni bheji hui requests dekhe (Attendee Side)
router.get("/attendee/:id", async (req, res) => {
  try {
    const meetings = await Meeting.find({ attendeeId: req.params.id })
      .populate({ path: "exhibitorId", select: "shopName logo boothNumber" }) 
      .populate({ path: "expoId", select: "title" })
      .sort({ createdAt: -1 });
    
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. PATCH: Status Update (Approve/Reject)
router.patch("/status/:meetingId", async (req, res) => {
  try {
    const { status } = req.body;
    const meeting = await Meeting.findByIdAndUpdate(req.params.meetingId, { status }, { new: true });
    res.json({ message: "Status updated", data: meeting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const meetingId = req.params.id;
    await Meeting.findByIdAndDelete(meetingId);
    res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting meeting", error });
  }
});

module.exports = router;