const express = require('express');
const notificationService = require('../services/notification.service');
const { authenticate } = require('../../../shared/middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { limit = 50, unreadOnly = false } = req.query;
    const notifications = await notificationService.getUserNotifications(
      req.user.userId,
      parseInt(limit),
      unreadOnly === 'true'
    );
    res.json(notifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/unread/count', async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.userId);
    res.json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.userId);
    res.json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/read/all', async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;