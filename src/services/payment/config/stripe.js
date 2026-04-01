const Stripe = require('stripe');
const config = require('../../../shared/config/env');
const { logger } = require('../../../shared/utils/logger');

let stripe = null;

function initStripe() {
  if (!config.STRIPE_SECRET_KEY) {
    logger.warn('Stripe secret key not configured. Payment features will not work.');
    return null;
  }
  
  stripe = new Stripe(config.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    maxNetworkRetries: 3,
    timeout: 30000
  });
  
  logger.info('Stripe initialized');
  return stripe;
}

function getStripe() {
  if (!stripe) {
    throw new Error('Stripe not initialized. Call initStripe() first.');
  }
  return stripe;
}

async function verifyWebhookSignature(body, signature, webhookSecret) {
  const stripeInstance = getStripe();
  try {
    return stripeInstance.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    logger.error('Webhook signature verification failed:', error);
    throw error;
  }
}

module.exports = { initStripe, getStripe, verifyWebhookSignature };
