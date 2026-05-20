const express = require('express');
const router = express.Router();
const Notification = require('../Models/Notification');

// 1. ADMIN BROADCAST
router.post('/broadcast', async (req, res) => {
  try {
    const { message, recipientType, type } = req.body; 
    const newNotif = await Notification.create({
      recipient: recipientType,
      recipientId: null,
      message: message,
      type: type || 'broadcast',
      senderRole: 'admin', 
      isRead: false
    });
    res.status(201).json(newNotif);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Attendee Route: Sirf event reminders aur admin announcements
router.get('/attendee/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notifs = await Notification.find({
      $or: [
        { recipient: 'all' }, 
        { type: 'event_reminder', recipientId: id }, // Specific user reminder
        { type: 'event_reminder', recipient: 'attendee' } // All attendee reminder
      ]
    }).sort({ createdAt: -1 });
    res.json(notifs);
  } catch (err) { res.status(500).json(err); }
});

// 3. EXHIBITOR FETCH (Yeh miss tha aapke code mein)
router.get('/exhibitor/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notifs = await Notification.find({
      $or: [
        { recipient: 'all' }, 
        { recipient: 'exhibitor', recipientId: id }, 
        { recipient: 'exhibitor', recipientId: null } 
      ]
    }).sort({ createdAt: -1 });
    res.json(notifs);
  } catch (err) { res.status(500).json(err); }
});

// 4. MARK READ ROUTES
router.put('/mark-read-attendee/:userId', async (req, res) => {
  try {
    await Notification.updateMany({
      $or: [{ recipientId: req.params.userId }, { recipient: 'all' }, { recipient: 'attendee', recipientId: null }],
      isRead: false
    }, { isRead: true });
    res.json({ message: "Success" });
  } catch (err) { res.status(500).json(err); }
});

router.put('/mark-read-exhibitor/:userId', async (req, res) => {
  try {
    await Notification.updateMany({
      $or: [{ recipientId: req.params.userId }, { recipient: 'all' }, { recipient: 'exhibitor', recipientId: null }],
      isRead: false
    }, { isRead: true });
    res.json({ message: "Success" });
  } catch (err) { res.status(500).json(err); }
});

// Event reminder broadcast
router.post('/event-reminder', async (req, res) => {
  try {
    const { message, eventName } = req.body;
    const notif = await Notification.create({
      recipient: 'all',
      recipientId: null,
      message: message,
      type: 'event_reminder',   // ← yeh type use karo
      senderRole: 'system',
      isRead: false
    });
    res.status(201).json(notif);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
// 5. ADMIN FETCH (Saare notifications dekhne ke liye)
router.get('/admin', async (req, res) => {
  try {
    const notifs = await Notification.find({
      $and: [
        { type: { $ne: 'event_reminder' } }, // Attendee reminders admin ko nahi chahiye
        { 
          $or: [
            { senderRole: 'exhibitor' },      // Exhibitor ki taraf se aayi request
            { recipient: 'admin' },           // Direct admin ko bheji gayi mail
            { senderRole: 'admin' }           // Admin ki apni purani history
          ] 
        }
      ]
    }).sort({ createdAt: -1 });
    res.json(notifs);
  } catch (err) { res.status(500).json(err); }
});

// 6. MARK READ FOR ADMIN
router.put('/mark-read-admin', async (req, res) => {
  try {
    await Notification.updateMany({
      $or: [{ recipient: 'admin' }, { recipient: 'all' }],
      isRead: false
    }, { isRead: true });
    res.json({ message: "Admin notifications marked as read" });
  } catch (err) { 
    res.status(500).json(err); 
  }
});
module.exports = router;