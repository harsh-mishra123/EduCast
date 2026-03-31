const stripeService = require('../services/stripe.service');
const paymentService = require('../services/payment.service');
const config = require('../../../shared/config/env');
const { logger } = require('../../../shared/utils/logger');

class WebhookController {
  async handleWebhook(req, res) {
    const signature = req.headers['stripe-signature'];
    
    try {
      const event = stripeService.constructWebhookEvent(
        req.body,
        signature,
        config.STRIPE_WEBHOOK_SECRET
      );
      
      await paymentService.handleWebhookEvent(event);
      
      res.json({ received: true });
    } catch (error) {
      logger.error('Webhook error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new WebhookController();