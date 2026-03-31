const WebSocketServer = require('./server');

class ConnectionManager {
  constructor(server) {
    this.wsServer = new WebSocketServer(server);
  }
  
  broadcast(lectureId, message) {
    this.wsServer.broadcastToLecture(lectureId, message);
  }
  
  sendToSession(sessionId, message) {
    const ws = this.wsServer.peerSocketMap.get(sessionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}

module.exports = ConnectionManager;