const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true
  },
  userAvatar: String,
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['text', 'system', 'announcement'],
    default: 'text'
  },
  readBy: [{
    userId: mongoose.Schema.Types.ObjectId,
    readAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

messageSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);