const { getStripe } = require('../config/stripe');
const { logger } = require('../../../shared/utils/logger');

class StripeService {
  async createPaymentIntent(amount, currency, metadata, customerId = null) {
    const stripe = getStripe();
    
    const params = {
      amount: Math.round(amount * 100),
      currency: currency || 'usd',
      metadata,
      automatic_payment_methods: { enabled: true }
    };
    
    if (customerId) {
      params.customer = customerId;
    }
    
    const paymentIntent = await stripe.paymentIntents.create(params);
    logger.info(`Payment intent created: ${paymentIntent.id}`);
    
    return paymentIntent;
  }
  
  async createPaymentLink(amount, currency, metadata, successUrl, cancelUrl) {
    const stripe = getStripe();
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency || 'usd',
          product_data: {
            name: metadata.courseTitle || metadata.lectureTitle || 'ClassCast Purchase',
            description: metadata.description
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata
    });
    
    logger.info(`Payment link created: ${session.id}`);
    return session;
  }
  
  async createConnectAccount(email, country = 'US') {
    const stripe = getStripe();
    
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true }
      }
    });
    
    logger.info(`Connect account created: ${account.id}`);
    return account;
  }
  
  async createAccountLink(accountId, refreshUrl, returnUrl) {
    const stripe = getStripe();
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding'
    });
    
    return accountLink;
  }
  
  async transferToEducator(amount, currency, destinationAccountId, metadata) {
    const stripe = getStripe();
    
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: currency || 'usd',
      destination: destinationAccountId,
      metadata,
      transfer_group: metadata.transferGroup
    });
    
    logger.info(`Transfer created: ${transfer.id} to ${destinationAccountId}`);
    return transfer;
  }
  
  async createPayout(amount, currency, destinationAccountId, metadata) {
    const stripe = getStripe();
    
    const payout = await stripe.payouts.create({
      amount: Math.round(amount * 100),
      currency: currency || 'usd',
      metadata
    }, {
      stripeAccount: destinationAccountId
    });
    
    logger.info(`Payout created: ${payout.id}`);
    return payout;
  }
  
  async getAccountBalance(accountId) {
    const stripe = getStripe();
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId
    });
    
    return balance;
  }
  
  async constructWebhookEvent(body, signature, webhookSecret) {
    const stripe = getStripe();
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }
  
  async refundPayment(paymentIntentId, amount = null, reason = null) {
    const stripe = getStripe();
    
    const params = { payment_intent: paymentIntentId };
    if (amount) {
      params.amount = Math.round(amount * 100);
    }
    if (reason) {
      params.reason = reason;
    }
    
    const refund = await stripe.refunds.create(params);
    logger.info(`Refund created: ${refund.id} for ${paymentIntentId}`);
    
    return refund;
  }
}

module.exports = new StripeService();