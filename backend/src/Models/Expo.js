
const mongoose = require('mongoose');


const expoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, default: "" },
  theme: { type: String },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  location: {
    venue: String,
    city: String,
    address: String
  },
  
  capacity: { type: Number, default: 0 },

  // --- 1. ATTENDEES (Requirement: Attendee Engagement) ---
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Jin logon ne is event ke liye register kiya
  }],

  // --- 2. SCHEDULE (Requirement: Schedule Management) ---
  schedule: [{
    timeSlot: String,   // e.g., "10:00 AM - 11:00 AM"
    sessionTitle: String,
    topic: String,
    speaker: String,
    location: String    // e.g., "Hall A" or "Main Stage"
  }],

 // Models/Expo.js mein kuch aisa hona chahiye
booths: {
    total: Number,
    available: Number,
    layout: [{
        id: String,
        status: String,
        exhibitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        companyName: String,
        boothDetails: {
    shopName: String,
    description: String,
     leads: { type: Number, default: 0 },    // ✅ Yeh add kar
    queries: { type: Number, default: 0 },  // ✅ Yeh add kar
    views: { type: Number, default: 0 },
    products: [{ name: String, price: String, description: String, image: String }], // 🟢 Updated
    staff: [{ name: String, email: String, phone: String, role: String, isPassIssued: Boolean, passId: String }] // 🟢 Updated
}
    }]
  
},
appliedExhibitors: [{ type: String }], 
  views: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'active', 'completed'], default: 'draft' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expo', expoSchema);