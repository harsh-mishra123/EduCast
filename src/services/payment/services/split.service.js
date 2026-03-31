const config = require('../../../shared/config/env');

class SplitPaymentService {
  constructor() {
    this.educatorPercent = config.EDUCATOR_SPLIT_PERCENT;
    this.platformPercent = config.PLATFORM_SPLIT_PERCENT;
    this.charityPercent = config.CHARITY_SPLIT_PERCENT;
  }
  
  calculateSplit(amount) {
    const educatorAmount = (amount * this.educatorPercent) / 100;
    const platformAmount = (amount * this.platformPercent) / 100;
    const charityAmount = (amount * this.charityPercent) / 100;
    
    return {
      total: amount,
      educator: Math.round(educatorAmount * 100) / 100,
      platform: Math.round(platformAmount * 100) / 100,
      charity: Math.round(charityAmount * 100) / 100,
      percentages: {
        educator: this.educatorPercent,
        platform: this.platformPercent,
        charity: this.charityPercent
      }
    };
  }
  
  validateSplit(total, split) {
    const sum = split.educator + split.platform + split.charity;
    return Math.abs(sum - total) < 0.01;
  }
  
  async executeSplit(paymentIntent, split, educatorAccountId, charityAccountId) {
    const transfers = [];
    
    // Transfer to educator
    if (split.educator > 0 && educatorAccountId) {
      transfers.push({
        amount: split.educator,
        destination: educatorAccountId,
        metadata: { type: 'educator_share' }
      });
    }
    
    // Transfer to charity
    if (split.charity > 0 && charityAccountId) {
      transfers.push({
        amount: split.charity,
        destination: charityAccountId,
        metadata: { type: 'charity_share' }
      });
    }
    
    return transfers;
  }
}

module.exports = new SplitPaymentService();