const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');
const stripeService = require('./stripe.service');
const splitService = require('./split.service');
const { publishToQueue, QUEUES } = require('../../../shared/utils/rabbitmq');
const { logger } = require('../../../shared/utils/logger');

class PaymentService {
  async createPaymentSession(userId, itemType, itemId, amount, itemDetails) {
    const metadata = {
      userId: userId.toString(),
      itemType,
      itemId: itemId.toString(),
      title: itemDetails.title,
      description: itemDetails.description
    };
    
    const session = await stripeService.createPaymentLink(
      amount,
      'usd',
      metadata,
      `${process.env.FRONTEND_URL}/payment/success?type=${itemType}&id=${itemId}`,
      `${process.env.FRONTEND_URL}/payment/cancel`
    );
    
    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      type: itemType,
      amount,
      status: 'pending',
      stripeSessionId: session.id,
      metadata
    });
    
    return {
      sessionId: session.id,
      url: session.url,
      transactionId: transaction._id
    };
  }
  
  async handlePaymentSuccess(sessionId) {
    const stripe = stripeService.getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    const transaction = await Transaction.findOneAndUpdate(
      { stripeSessionId: sessionId },
      {
        status: 'completed',
        stripePaymentIntentId: session.payment_intent,
        completedAt: new Date(),
        splitBreakdown: splitService.calculateSplit(session.amount_total / 100)
      },
      { new: true }
    );
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    // Publish payment completed event
    await publishToQueue(QUEUES.PAYMENT_COMPLETED, {
      userId: transaction.userId,
      type: transaction.type,
      courseId: transaction.courseId,
      lectureId: transaction.lectureId,
      amount: transaction.amount,
      paymentId: transaction._id,
      itemTitle: transaction.metadata?.title
    });
    
    logger.info(`Payment completed: ${sessionId}`);
    return transaction;
  }
  
  async handleWebhookEvent(event) {
    const stripe = stripeService.getStripe();
    
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handlePaymentSuccess(event.data.object.id);
        break;
        
      case 'payment_intent.succeeded':
        // Update transaction status
        await Transaction.findOneAndUpdate(
          { stripePaymentIntentId: event.data.object.id },
          { status: 'completed', completedAt: new Date() }
        );
        break;
        
      case 'payment_intent.payment_failed':
        await Transaction.findOneAndUpdate(
          { stripePaymentIntentId: event.data.object.id },
          { status: 'failed' }
        );
        break;
        
      case 'charge.refunded':
        await this.handleRefund(event.data.object);
        break;
        
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }
  }
  
  async handleRefund(charge) {
    await Transaction.findOneAndUpdate(
      { stripePaymentIntentId: charge.payment_intent },
      {
        status: 'refunded',
        refundedAt: new Date(),
        refundReason: charge.refund_reason
      }
    );
    
    await publishToQueue(QUEUES.PAYMENT_REFUNDED, {
      paymentIntentId: charge.payment_intent,
      amount: charge.amount_refunded / 100
    });
  }
  
  async getTransactionHistory(userId, limit = 50, skip = 0) {
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await Transaction.countDocuments({ userId });
    
    return { transactions, total, limit, skip };
  }
  
  async getEducatorEarnings(educatorId, startDate, endDate) {
    const query = {
      educatorId,
      type: { $in: ['course', 'live'] },
      status: 'completed'
    };
    
    if (startDate) query.createdAt = { $gte: new Date(startDate) };
    if (endDate) query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    
    const transactions = await Transaction.find(query);
    
    const total = transactions.reduce((sum, t) => sum + (t.splitBreakdown?.educator || 0), 0);
    
    return {
      total,
      count: transactions.length,
      transactions
    };
  }
  
  async createPayout(educatorId, educatorAccountId, amount, transactionIds) {
    const payout = await Payout.create({
      educatorId,
      stripeConnectAccountId: educatorAccountId,
      amount,
      status: 'pending',
      transactionIds
    });
    
    // Initiate Stripe payout
    const stripePayout = await stripeService.createPayout(
      amount,
      'usd',
      educatorAccountId,
      { payoutId: payout._id.toString() }
    );
    
    payout.stripePayoutId = stripePayout.id;
    payout.status = 'processing';
    await payout.save();
    
    await publishToQueue(QUEUES.PAYOUT_READY, {
      educatorId,
      payoutId: payout._id,
      amount,
      stripePayoutId: stripePayout.id
    });
    
    return payout;
  }
}

module.exports = new PaymentService();