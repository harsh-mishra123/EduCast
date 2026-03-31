const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: 'Too many failed attempts, try again later.' }
});

module.exports = { limiter, authLimiter };
