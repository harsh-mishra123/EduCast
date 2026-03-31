const { Server } = require('socket.io');
const socketConfig = require('../config/socket');
const { authenticate } = require('../../../shared/middleware/auth');
const { handleConnection } = require('./handlers');

let io = null;

function initWebSocket(server) {
  io = new Server(server, socketConfig);
  
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      
      const decoded = await authenticate(token);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });
  
  io.on('connection', (socket) => {
    handleConnection(io, socket);
  });
  
  return io;
}

function getIO() {
  if (!io) {
    throw new Error('WebSocket not initialized');
  }
  return io;
}

module.exports = { initWebSocket, getIO };