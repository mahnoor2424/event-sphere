const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  expoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
  exhibitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  appliedAt: { type: Date, default: Date.now },
  assignedBooth: { type: String, default: "" } // Admin approve karte waqt ye bharega
});

module.exports = mongoose.model("Application", applicationSchema);