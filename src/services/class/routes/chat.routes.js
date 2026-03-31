const express = require('express');
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../../../shared/middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/:roomId/messages', chatController.getMessages);
router.get('/:roomId/users', chatController.getRoomUsers);
router.get('/:roomId/count', chatController.getRoomCount);
router.get('/:roomId/unread', chatController.getUnreadCount);
router.post('/:roomId/read', chatController.markRead);

module.exports = router;