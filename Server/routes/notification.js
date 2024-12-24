const express = require('express');
const notification = require('../controllers/notification');
const router = express.Router();

// Get all notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await notification.getUserNotifications(userId);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get unread notifications count
router.get('/:userId/unread/count', async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await notification.getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const updatedNotification = await notification.markAsRead(notificationId);
    res.json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read for a user
router.put('/:userId/read/all', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await notification.markAllAsRead(userId);
    res.json(result);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
