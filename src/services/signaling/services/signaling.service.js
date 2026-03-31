const tokenService = require('./token.service');
const { logger } = require('../../../shared/utils/logger');

class SignalingService {
  constructor() {
    this.sessions = new Map(); // sessionId -> session data
  }
  
  createSession(lectureId, userId, userName) {
    const sessionId = `${lectureId}_${userId}_${Date.now()}`;
    const token = tokenService.generateJoinToken(lectureId, userId, userName);
    
    const session = {
      sessionId,
      lectureId,
      userId,
      userName,
      token,
      createdAt: new Date(),
      peerId: null,
      socketId: null
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }
  
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }
  
  updateSession(sessionId, updates) {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
      this.sessions.set(sessionId, session);
    }
    return session;
  }
  
  deleteSession(sessionId) {
    this.sessions.delete(sessionId);
  }
  
  async validateJoin(lectureId, token) {
    try {
      const decoded = tokenService.verifyJoinToken(token);
      
      if (decoded.lectureId !== lectureId) {
        throw new Error('Token does not match lecture');
      }
      
      return {
        valid: true,
        userId: decoded.userId,
        userName: decoded.userName
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
  
  getSessionByPeerId(peerId) {
    for (const [sessionId, session] of this.sessions) {
      if (session.peerId === peerId) {
        return session;
      }
    }
    return null;
  }
}

module.exports = new SignalingService();