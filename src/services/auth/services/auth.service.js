const User = require('../models/User');
const jwtService = require('./jwt.service');
const { setSession } = require('../../../shared/utils/redis');
const { publishToQueue, QUEUES } = require('../../../shared/utils/rabbitmq');

class AuthService {
  async register(name, email, password, role = 'student') {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const user = await User.create({ name, email, password, role });
    const tokens = jwtService.generateTokens(user._id, user.role);
    
    await setSession(user._id, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    const userObj = user.toObject();
    delete userObj.password;
    return { user: userObj, ...tokens };
  }
  
  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    const tokens = jwtService.generateTokens(user._id, user.role);
    await setSession(user._id, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    const userObj = user.toObject();
    delete userObj.password;
    return { user: userObj, ...tokens };
  }
  
  async logout(accessToken, refreshToken) {
    await jwtService.revokeToken(accessToken);
    await jwtService.revokeToken(refreshToken);
    return { success: true };
  }
  
  async refreshToken(refreshToken) {
    const decoded = jwtService.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }
    return jwtService.generateTokens(user._id, user.role);
  }
  
  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
  
  async updateProfile(userId, data) {
    const allowed = ['name', 'avatar'];
    const update = {};
    
    for (const key of allowed) {
      if (data[key]) update[key] = data[key];
    }
    
    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
    return user;
  }
  
  async upgradeToEducator(userId, stripeConnectAccountId) {
    const user = await User.findByIdAndUpdate(userId, {
      role: 'educator',
      stripeConnectAccountId
    }, { new: true }).select('-password');
    
    return user;
  }
}

module.exports = new AuthService();
