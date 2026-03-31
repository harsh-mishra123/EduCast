const WebSocket = require('ws');
const signalingService = require('../services/signaling.service');
const tokenService = require('../services/token.service');
const { logger } = require('../../../shared/utils/logger');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.peerSocketMap = new Map();
    this.setupHandlers();
  }
  
  setupHandlers() {
    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'Token required');
        return;
      }
      
      let payload;
      try {
        payload = tokenService.verifyJoinToken(token);
      } catch (error) {
        ws.close(1008, 'Invalid token');
        return;
      }
      
      const { lectureId, userId, userName } = payload;
      const session = signalingService.createSession(lectureId, userId, userName);
      
      ws.sessionId = session.sessionId;
      ws.userId = userId;
      ws.lectureId = lectureId;
      
      this.peerSocketMap.set(session.sessionId, ws);
      
      logger.info(`Client connected: ${userId} to lecture ${lectureId}`);
      
      ws.send(JSON.stringify({
        type: 'connected',
        sessionId: session.sessionId,
        token: session.token
      }));
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          await this.handleMessage(ws, message);
        } catch (error) {
          logger.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ error: error.message }));
        }
      });
      
      ws.on('close', () => {
        this.handleDisconnect(ws);
      });
    });
  }
  
  async handleMessage(ws, message) {
    const { type, data } = message;
    
    switch (type) {
      case 'register-peer':
        await this.handleRegisterPeer(ws, data);
        break;
        
      case 'signal':
        await this.handleSignal(ws, data);
        break;
        
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
        
      default:
        logger.warn(`Unknown message type: ${type}`);
    }
  }
  
  async handleRegisterPeer(ws, data) {
    const { peerId, mediaServerUrl } = data;
    
    signalingService.updateSession(ws.sessionId, {
      peerId,
      mediaServerUrl
    });
    
    ws.send(JSON.stringify({
      type: 'peer-registered',
      peerId,
      lectureId: ws.lectureId
    }));
    
    // Broadcast to other participants
    this.broadcastToLecture(ws.lectureId, {
      type: 'participant-joined',
      userId: ws.userId,
      sessionId: ws.sessionId
    }, ws.sessionId);
  }
  
  async handleSignal(ws, data) {
    const { targetSessionId, signal } = data;
    
    const targetWs = this.peerSocketMap.get(targetSessionId);
    if (targetWs && targetWs.readyState === WebSocket.OPEN) {
      targetWs.send(JSON.stringify({
        type: 'signal',
        from: ws.sessionId,
        signal
      }));
    }
  }
  
  handleDisconnect(ws) {
    const session = signalingService.getSession(ws.sessionId);
    
    if (session) {
      logger.info(`Client disconnected: ${session.userId}`);
      
      // Broadcast to other participants
      this.broadcastToLecture(ws.lectureId, {
        type: 'participant-left',
        userId: ws.userId,
        sessionId: ws.sessionId
      }, ws.sessionId);
      
      signalingService.deleteSession(ws.sessionId);
      this.peerSocketMap.delete(ws.sessionId);
    }
  }
  
  broadcastToLecture(lectureId, message, excludeSessionId = null) {
    for (const [sessionId, ws] of this.peerSocketMap) {
      if (ws.lectureId === lectureId && sessionId !== excludeSessionId) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      }
    }
  }
}

module.exports = WebSocketServer;