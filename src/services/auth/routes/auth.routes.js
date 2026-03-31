const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../../../shared/middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { authLimiter } = require('../../../shared/middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/refresh', authController.refresh);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/upgrade-educator', authenticate, authController.upgradeToEducator);

module.exports = router;
