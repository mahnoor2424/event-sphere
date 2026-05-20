const mongoose = require("mongoose");

const MeetingSchema = new mongoose.Schema({
  attendeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // ❗ Yahan 'Event' likhen kyunki aapka model name 'Event' hai
  exhibitorId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true }, 
  
  expoId: { type: mongoose.Schema.Types.ObjectId, ref: "Expo", required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  note: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Meeting", MeetingSchema);