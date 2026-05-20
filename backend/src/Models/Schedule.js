const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  expoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expo", // Expo model se link hai
    required: true,
    
  },
  type: { 
  type: String, 
  enum: ["Speech", "Seminar", "Workshop", "Concert", "Networking"],
  default: "Speech"
},
 day: { type: String, required: true }, // "Day 1", "Day 2", etc.
  expoName: { type: String, required: true }, // "Tech Expo 2024"
  title: { type: String, required: true },
  description: String,
  reminderSent: { type: Boolean, default: false },
  speaker: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // e.g., "10:00 AM"
  endTime: { type: String, required: true },   // e.g., "11:30 AM"
  location: { type: String, required: true }, // e.g., "Seminar Hall B"
  bookmarks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true } // Active filter ke liye
});

module.exports = mongoose.model("Schedule", scheduleSchema);