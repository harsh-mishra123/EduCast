const Message = require('../models/Message');
const { getRedis } = require('../../../shared/utils/redis');
const { logger } = require('../../../shared/utils/logger');

class ChatService {
  async saveMessage(roomId, userId, userName, userAvatar, content, type = 'text') {
    const message = await Message.create({
      roomId,
      userId,
      userName,
      userAvatar,
      content,
      type
    });
    
    // Store last message in Redis for quick access
    const redis = getRedis();
    await redis.setex(`last_msg:${roomId}`, 3600, JSON.stringify({
      content,
      userName,
      userId,
      createdAt: message.createdAt
    }));
    
    return message;
  }
  
  async getMessages(roomId, limit = 50, before = null) {
    const query = { roomId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    return await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
  
  async markAsRead(roomId, userId, messageIds) {
    await Message.updateMany(
      { _id: { $in: messageIds }, roomId },
      { $addToSet: { readBy: { userId, readAt: new Date() } } }
    );
  }
  
  async getUnreadCount(roomId, userId) {
    return await Message.countDocuments({
      roomId,
      'readBy.userId': { $ne: userId }
    });
  }
  
  async deleteMessages(roomId, before) {
    const result = await Message.deleteMany({
      roomId,
      createdAt: { $lt: before }
    });
    
    logger.info(`Deleted ${result.deletedCount} messages from room ${roomId}`);
    return result;
  }
}

module.exports = new ChatService();