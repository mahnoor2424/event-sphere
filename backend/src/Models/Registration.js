const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  attendeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo' },
  ticketId: { type: String, unique: true },
  registeredAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Registration", registrationSchema);