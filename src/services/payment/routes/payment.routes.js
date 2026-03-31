const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { authenticate, requireRole } = require('../../../shared/middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/checkout', paymentController.createCheckoutSession);
router.get('/transactions', paymentController.getTransactionHistory);
router.get('/earnings', requireRole(['educator']), paymentController.getEducatorEarnings);
router.post('/create-account-link', requireRole(['educator']), paymentController.createAccountLink);
router.get('/balance/:accountId', requireRole(['educator']), paymentController.getAccountBalance);
router.post('/payout', requireRole(['educator']), paymentController.createPayout);

module.exports = router;