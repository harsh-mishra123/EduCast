// Mock Redis for initial testing
let mockStore = new Map();

async function connectRedis() {
  console.log('Mock Redis connected');
  return true;
}

function getRedis() {
  return {
    incr: async (key) => {
      const val = (mockStore.get(key) || 0) + 1;
      mockStore.set(key, val);
      return val;
    },
    setex: async (key, ttl, value) => {
      mockStore.set(key, value);
      return 'OK';
    },
    get: async (key) => mockStore.get(key) || null,
    del: async (key) => mockStore.delete(key),
    expire: async (key, seconds) => true
  };
}

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

async function blacklistToken(token, expiresInSeconds) {
  const redis = getRedis();
  await redis.setex(`blacklist:${token}`, expiresInSeconds, 'true');
}

async function isTokenBlacklisted(token) {
  const redis = getRedis();
  const result = await redis.get(`blacklist:${token}`);
  return result === 'true';
}

module.exports = {
  connectRedis,
  getRedis,
  setSession,
  getSession,
  deleteSession,
  blacklistToken,
  isTokenBlacklisted
};
