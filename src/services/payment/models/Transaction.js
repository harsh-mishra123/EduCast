const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  educatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveLecture'
  },
  type: {
    type: String,
    enum: ['course', 'live', 'payout', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: String,
  stripePaymentLinkId: String,
  stripeSessionId: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  splitBreakdown: {
    educator: Number,
    platform: Number,
    charity: Number
  },
  refundedAt: Date,
  refundReason: String,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ educatorId: 1, createdAt: -1 });
transactionSchema.index({ stripePaymentIntentId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Transaction', transactionSchema);