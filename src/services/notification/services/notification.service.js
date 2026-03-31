const Notification = require('../models/Notification');

class NotificationService {
  async createNotification(userId, title, message, type = 'in_app', data = null) {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data
    });
    
    return notification;
  }
  
  async getUserNotifications(userId, limit = 50, unreadOnly = false) {
    const query = { userId };
    if (unreadOnly) {
      query.read = false;
    }
    
    return await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
  }
  
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true, readAt: new Date() },
      { new: true }
    );
    
    return notification;
  }
  
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );
    
    return result;
  }
  
  async getUnreadCount(userId) {
    return await Notification.countDocuments({ userId, read: false });
  }
  
  async deleteNotification(notificationId, userId) {
    const result = await Notification.deleteOne({ _id: notificationId, userId });
    return result;
  }
}

module.exports = new NotificationService();