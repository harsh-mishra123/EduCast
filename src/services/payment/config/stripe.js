const Stripe = require('stripe');
const config = require('../../../shared/config/env');

let stripe = null;

function initStripe() {
  if (!stripe) {
    stripe = new Stripe(config.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      maxNetworkRetries: 3
    });
  }
  return stripe;
}

function getStripe() {
  if (!stripe) {
    throw new Error('Stripe not initialized. Call initStripe() first.');
  }
  return stripe;
}

module.exports = { initStripe, getStripe };