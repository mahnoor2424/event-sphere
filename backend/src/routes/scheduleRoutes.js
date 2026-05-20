const express = require("express");
const router = express.Router();
const Schedule = require("../Models/Schedule");
const Meeting = require("../Models/Meeting");

// 1. CREATE SESSION
router.post("/create", async (req, res) => {
  try {
    const newSession = new Schedule(req.body);
    await newSession.save();
    res.status(201).json({ message: "Session Created Successfully", data: newSession });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET ALL SESSIONS FOR A SPECIFIC EXPO
router.get("/expo/:id", async (req, res) => {
  try {
    const sessions = await Schedule.find({ expoId: req.params.id }).sort({ date: 1, startTime: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. UPDATE SESSION (Requirement: Allow changes)
router.put("/update/:id", async (req, res) => {
  try {
    const updatedSession = await Schedule.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ message: "Session Updated", data: updatedSession });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. DELETE SESSION (Requirement: Manage schedule)
router.delete("/delete/:id", async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Session Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. GET SINGLE SESSION BY ID (For Edit Form)
router.get("/session/:id", async (req, res) => {
    try {
      const session = await Schedule.findById(req.params.id);
      res.json(session);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});
// 6. GET ALL SESSIONS (Zaroori hai saare schedules manage karne ke liye)
router.get("/all", async (req, res) => {
  try {
    // Saare schedules ko date aur time ke hisaab se sort karke mangwayein
    const sessions = await Schedule.find().sort({ date: 1, startTime: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post('/book', async (req, res) => {
  try {
    const meeting = new Meeting(req.body); // ✅ Ab kaam karega
    await meeting.save();
    res.status(201).json({ success: true, meeting });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;