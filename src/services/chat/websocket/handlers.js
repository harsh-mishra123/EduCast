const chatService = require('../services/chat.service');
const roomService = require('../services/room.service');
const { logger } = require('../../../shared/utils/logger');

function handleConnection(io, socket) {
  const userId = socket.user.userId;
  logger.info(`User ${userId} connected: ${socket.id}`);
  
  socket.on('join:room', async (roomId) => {
    try {
      await roomService.joinRoom(roomId, userId, {
        id: userId,
        name: socket.user.name,
        socketId: socket.id
      });
      
      socket.join(roomId);
      
      const users = await roomService.getRoomUsers(roomId);
      io.to(roomId).emit('room:users', users);
      
      const count = await roomService.getRoomCount(roomId);
      io.to(roomId).emit('room:count', count);
      
      logger.info(`User ${userId} joined room ${roomId}`);
    } catch (error) {
      logger.error('Join room error:', error);
      socket.emit('error', { message: error.message });
    }
  });
  
  socket.on('leave:room', async (roomId) => {
    try {
      await roomService.leaveRoom(roomId, userId);
      socket.leave(roomId);
      
      const users = await roomService.getRoomUsers(roomId);
      io.to(roomId).emit('room:users', users);
      
      const count = await roomService.getRoomCount(roomId);
      io.to(roomId).emit('room:count', count);
      
      logger.info(`User ${userId} left room ${roomId}`);
    } catch (error) {
      logger.error('Leave room error:', error);
      socket.emit('error', { message: error.message });
    }
  });
  
  socket.on('message:send', async (data) => {
    try {
      const { roomId, content, type = 'text' } = data;
      
      const message = await chatService.saveMessage(
        roomId,
        userId,
        socket.user.name || 'User',
        socket.user.avatar,
        content,
        type
      );
      
      io.to(roomId).emit('message:new', message);
    } catch (error) {
      logger.error('Send message error:', error);
      socket.emit('error', { message: error.message });
    }
  });
  
  socket.on('typing:start', (roomId) => {
    socket.to(roomId).emit('typing:user', {
      userId,
      name: socket.user.name
    });
  });
  
  socket.on('typing:stop', (roomId) => {
    socket.to(roomId).emit('typing:stopped', { userId });
  });
  
  socket.on('disconnect', async () => {
    const rooms = await roomService.getUserRooms(userId);
    
    for (const roomId of rooms) {
      await roomService.leaveRoom(roomId, userId);
      
      const users = await roomService.getRoomUsers(roomId);
      io.to(roomId).emit('room:users', users);
      
      const count = await roomService.getRoomCount(roomId);
      io.to(roomId).emit('room:count', count);
    }
    
    logger.info(`User ${userId} disconnected`);
  });
}

module.exports = { handleConnection };