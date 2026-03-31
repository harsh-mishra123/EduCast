const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  educatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  stripeConnectAccountId: {
    type: String,
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
    enum: ['pending', 'processing', 'paid', 'failed', 'cancelled'],
    default: 'pending'
  },
  stripePayoutId: String,
  stripeTransferId: String,
  transactionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  periodStart: Date,
  periodEnd: Date,
  failureMessage: String,
  processedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

payoutSchema.index({ educatorId: 1, status: 1 });
payoutSchema.index({ stripePayoutId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Payout', payoutSchema);