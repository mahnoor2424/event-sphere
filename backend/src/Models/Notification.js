const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: String, enum: ['admin', 'exhibitor', 'attendee', 'all'], required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  type: { type: String, default: 'info' },
  senderRole: { type: String, default: 'system' }, // admin, exhibitor, system
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);