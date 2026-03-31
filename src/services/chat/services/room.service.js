const { getRedis } = require('../../../shared/utils/logger');

class RoomService {
  async joinRoom(roomId, userId, userData) {
    const redis = getRedis();
    await redis.hset(`room:users:${roomId}`, userId, JSON.stringify(userData));
    await redis.sadd(`user:rooms:${userId}`, roomId);
    await redis.hincrby(`room:count:${roomId}`, 'count', 1);
    
    return await this.getRoomUsers(roomId);
  }
  
  async leaveRoom(roomId, userId) {
    const redis = getRedis();
    await redis.hdel(`room:users:${roomId}`, userId);
    await redis.srem(`user:rooms:${userId}`, roomId);
    await redis.hincrby(`room:count:${roomId}`, 'count', -1);
    
    return await this.getRoomUsers(roomId);
  }
  
  async getRoomUsers(roomId) {
    const redis = getRedis();
    const users = await redis.hgetall(`room:users:${roomId}`);
    return Object.values(users).map(u => JSON.parse(u));
  }
  
  async getUserRooms(userId) {
    const redis = getRedis();
    return await redis.smembers(`user:rooms:${userId}`);
  }
  
  async getRoomCount(roomId) {
    const redis = getRedis();
    const count = await redis.hget(`room:count:${roomId}`, 'count');
    return parseInt(count) || 0;
  }
  
  async isUserInRoom(roomId, userId) {
    const redis = getRedis();
    const exists = await redis.hexists(`room:users:${roomId}`, userId);
    return exists === 1;
  }
}

module.exports = new RoomService();