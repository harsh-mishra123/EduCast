const jwt = require('jsonwebtoken');
const config = require('../../../shared/config/env');
const { blacklistToken } = require('../../../shared/utils/redis');

class JWTService {
  generateTokens(userId, role) {
    const payload = { userId, role };
    
    const accessToken = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: '15m'
    });
    
    const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: '7d'
    });
    
    return { accessToken, refreshToken };
  }
  
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
  
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
  
  async revokeToken(token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiresIn > 0) {
          await blacklistToken(token, expiresIn);
        }
      }
    } catch (error) {
      console.error('Error revoking token:', error);
    }
  }
}

module.exports = new JWTService();
