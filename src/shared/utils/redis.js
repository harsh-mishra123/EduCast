const Redis = require('ioredis');
const config = require('../config/env');
const { logger } = require('./logger');

let redisClient = null;

async function connectRedis() {
  try {
    const url = config.REDIS_URL || 'redis://localhost:6379';
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
    });
    
    // Test connection
    await redisClient.ping();
    logger.info('Redis ready');
    
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

function getRedis() {
  if (!redisClient) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return redisClient;
}

// Rate limiting
async function rateLimit(key, limit, windowSeconds) {
  const redis = getRedis();
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  return current <= limit;
}

// Session management
async function setSession(userId, data, ttlSeconds = 86400) {
  const redis = getRedis();
  await redis.setex(`session:${userId}`, ttlSeconds, JSON.stringify(data));
}

async function getSession(userId) {
  const redis = getRedis();
  const data = await redis.get(`session:${userId}`);
  return data ? JSON.parse(data) : null;
}

async function deleteSession(userId) {
  const redis = getRedis();
  await redis.del(`session:${userId}`);
}

// Token blacklist
async function blacklistToken(token, expiresInSeconds) {
  const redis = getRedis();
  await redis.setex(`blacklist:${token}`, expiresInSeconds, 'true');
}

async function isTokenBlacklisted(token) {
  const redis = getRedis();
  const result = await redis.get(`blacklist:${token}`);
  return result === 'true';
}

// Room management (for live lectures)
async function addToRoom(roomId, userId, userData) {
  const redis = getRedis();
  await redis.hset(`room:${roomId}`, userId, JSON.stringify(userData));
  await redis.expire(`room:${roomId}`, 86400);
}

async function getRoomUsers(roomId) {
  const redis = getRedis();
  const users = await redis.hgetall(`room:${roomId}`);
  return Object.entries(users).map(([id, data]) => ({
    userId: id,
    ...JSON.parse(data)
  }));
}

async function removeFromRoom(roomId, userId) {
  const redis = getRedis();
  await redis.hdel(`room:${roomId}`, userId);
}

async function getRoomCount(roomId) {
  const redis = getRedis();
  return await redis.hlen(`room:${roomId}`);
}

// Cache helpers
async function setCache(key, data, ttlSeconds = 3600) {
  const redis = getRedis();
  await redis.setex(`cache:${key}`, ttlSeconds, JSON.stringify(data));
}

async function getCache(key) {
  const redis = getRedis();
  const data = await redis.get(`cache:${key}`);
  return data ? JSON.parse(data) : null;
}

async function invalidateCache(pattern) {
  const redis = getRedis();
  const keys = await redis.keys(`cache:${pattern}`);
  if (keys.length) {
    await redis.del(keys);
  }
}

module.exports = {
  connectRedis,
  getRedis,
  rateLimit,
  setSession,
  getSession,
  deleteSession,
  blacklistToken,
  isTokenBlacklisted,
  addToRoom,
  getRoomUsers,
  removeFromRoom,
  getRoomCount,
  setCache,
  getCache,
  invalidateCache
};
