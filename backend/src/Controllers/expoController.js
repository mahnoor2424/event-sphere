const Expo = require('../models/Expo');
const User = require('../models/User');
const Notification = require('../models/Notification'); // 1. Notification Model import karein
const sendEmail = require('../utils/sendEmail');

// --- 1. GET NOTIFICATIONS (Frontend ke liye route) ---
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 2. UPDATE STATUS (With Email + Dynamic DB Notification) ---
exports.updateStatus = async (req, res) => {
  try {
    const expo = await Expo.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { new: true }
    );

    if (!expo) return res.status(404).json({ message: "Expo not found" });

    // Agar status ACTIVE hua hai
    if (req.body.status === "active") {
      
      // --- A. SAVE DYNAMIC NOTIFICATION TO DB ---
      // Ye database mein save hoga taake Bell Icon par nazar aaye
      const newNotif = new Notification({
        message: `New Expo Live: "${expo.title}" is now open for booth bookings!`,
        type: 'expo_active',
        expoId: expo._id
      });
      await newNotif.save();

      // --- B. SEND EMAILS ---
      const exhibitors = await User.find({ role: "exhibitor" }).select("email");
      for (const ex of exhibitors) {
        try {
          await sendEmail(
            ex.email,
            "New Expo Live!",
            `A new expo "${expo.title}" is now live. Log in to book your booth!`
          );
        } catch (mailErr) {
          console.log(`Failed to send email to ${ex.email}`);
        }
      }
    }

    res.json(expo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 3. CREATE EXPO ---
exports.createExpo = async (req, res) => {
  try {
    const newExpo = new Expo(req.body);
    await newExpo.save();
    res.status(201).json(newExpo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 4. UPDATE FLOOR PLAN ---
exports.updateFloorPlan = async (req, res) => {
  try {
    const updatedExpo = await Expo.findByIdAndUpdate(
      req.params.id,
      { "booths.layout": req.body.layout }, 
      { new: true }
    );
    res.status(200).json({ message: "Floor plan updated", data: updatedExpo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 5. GET ALL EXPOS ---
exports.getAllExpos = async (req, res) => {
  try {
    const expos = await Expo.find().sort({ createdAt: -1 });
    res.status(200).json(expos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};