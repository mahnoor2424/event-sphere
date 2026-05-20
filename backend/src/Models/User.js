var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "exhibitor", "attendee"],
    default: "attendee"
  },
  organization: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  description: { type: String, default: "" },
  website: { type: String, default: "" },
  phone: { type: String, default: "" },
  logo: { type: String, default: "" }, 
  banner: { type: String, default: "" },
  documents: [String],
  city: { type: String, default: "" },
  appliedExpos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expo' }],
  isVerified: { type: Boolean, default: false },
verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

// ✅ FIX: Pehle check karein ke model pehle se bana toh nahi hua?
// Agar bana hua hai toh wahi use karein (mongoose.models.User)
// Agar nahi bana, toh naya banayein (mongoose.model("User", userSchema))
module.exports = mongoose.models.User || mongoose.model("User", userSchema);