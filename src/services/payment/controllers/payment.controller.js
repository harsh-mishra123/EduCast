const paymentService = require('../services/payment.service');
const stripeService = require('../services/stripe.service');

class PaymentController {
  async createCheckoutSession(req, res) {
    try {
      const { type, itemId, amount, title, description } = req.body;
      
      const session = await paymentService.createPaymentSession(
        req.user.userId,
        type,
        itemId,
        amount,
        { title, description }
      );
      
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getTransactionHistory(req, res) {
    try {
      const { limit = 50, skip = 0 } = req.query;
      const history = await paymentService.getTransactionHistory(
        req.user.userId,
        parseInt(limit),
        parseInt(skip)
      );
      res.json(history);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getEducatorEarnings(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const earnings = await paymentService.getEducatorEarnings(
        req.user.userId,
        startDate,
        endDate
      );
      res.json(earnings);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async createAccountLink(req, res) {
    try {
      const { accountId, refreshUrl, returnUrl } = req.body;
      const accountLink = await stripeService.createAccountLink(
        accountId,
        refreshUrl,
        returnUrl
      );
      res.json(accountLink);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getAccountBalance(req, res) {
    try {
      const { accountId } = req.params;
      const balance = await stripeService.getAccountBalance(accountId);
      res.json(balance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async createPayout(req, res) {
    try {
      const { amount, transactionIds } = req.body;
      const user = req.user;
      
      if (user.role !== 'educator') {
        return res.status(403).json({ error: 'Only educators can request payouts' });
      }
      
      const payout = await paymentService.createPayout(
        user.userId,
        user.stripeConnectAccountId,
        amount,
        transactionIds
      );
      
      res.json(payout);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new PaymentController();