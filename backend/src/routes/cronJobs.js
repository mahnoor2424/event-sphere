const cron = require('node-cron');
const Notification = require('../Models/Notification');
const Schedule = require('../Models/Schedule'); // aapka schedule model

// Har 1 ghante mein check karo
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Aane wale 24 ghante ke events dhundo
    const upcomingEvents = await Schedule.find({
      date: { $gte: now, $lte: in24Hours },
      reminderSent: { $ne: true } // duplicate na bheje
    });

    for (const event of upcomingEvents) {
      await Notification.create({
        recipient: 'all',
        recipientId: null,
        message: `Reminder: "${event.title}" is starting on ${new Date(event.date).toLocaleString()}. Don't miss it!`,
        type: 'event_reminder',
        senderRole: 'system',
        isRead: false
      });

      // Mark karo ke reminder bheja ja chuka hai
      await Schedule.findByIdAndUpdate(event._id, { reminderSent: true });
    }

    console.log(`✅ ${upcomingEvents.length} event reminders sent`);
  } catch (err) {
    console.error('Cron error:', err);
  }
});