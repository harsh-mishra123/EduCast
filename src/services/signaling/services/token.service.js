const jwt = require('jsonwebtoken');
const config = require('../../../shared/config/env');

class TokenService {
  generateRoomToken(roomId, userId, role) {
    return jwt.sign(
      { roomId, userId, role },
      config.JWT_SECRET,
      { expiresIn: '2h' }
    );
  }
  
  verifyRoomToken(token) {
    try {
      return jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
  
  generateJoinToken(lectureId, userId, userName) {
    return jwt.sign(
      { lectureId, userId, userName },
      config.JWT_SECRET,
      { expiresIn: '30m' }
    );
  }
  
  verifyJoinToken(token) {
    try {
      return jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid join token');
    }
  }
}

module.exports = new TokenService();