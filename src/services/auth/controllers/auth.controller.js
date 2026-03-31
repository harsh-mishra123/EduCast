const authService = require('../services/auth.service');
const { validationResult } = require('express-validator');

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register(name, email, password, role);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1];
    const { refreshToken } = req.body;
    
    await authService.logout(accessToken, refreshToken);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.userId);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await authService.updateProfile(req.user.userId, req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const upgradeToEducator = async (req, res) => {
  try {
    const { stripeConnectAccountId } = req.body;
    const user = await authService.upgradeToEducator(req.user.userId, stripeConnectAccountId);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  getProfile,
  updateProfile,
  upgradeToEducator
};
