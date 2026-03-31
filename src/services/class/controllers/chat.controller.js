const chatService = require('../services/chat.service');
const roomService = require('../services/room.service');

class ChatController {
  async getMessages(req, res) {
    try {
      const { roomId } = req.params;
      const { limit = 50, before } = req.query;
      
      const messages = await chatService.getMessages(roomId, parseInt(limit), before);
      res.json(messages);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getRoomUsers(req, res) {
    try {
      const { roomId } = req.params;
      const users = await roomService.getRoomUsers(roomId);
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getRoomCount(req, res) {
    try {
      const { roomId } = req.params;
      const count = await roomService.getRoomCount(roomId);
      res.json({ count });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async markRead(req, res) {
    try {
      const { roomId } = req.params;
      const { messageIds } = req.body;
      
      await chatService.markAsRead(roomId, req.user.userId, messageIds);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getUnreadCount(req, res) {
    try {
      const { roomId } = req.params;
      const count = await chatService.getUnreadCount(roomId, req.user.userId);
      res.json({ count });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ChatController();