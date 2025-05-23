const Transaction = require('../models/transaction.model');
const Flag = require('../models/flag.model');

const checkFraudRules = async ({ user, transaction, type }) => {
  const userId = user._id;


  // Rule 1- More than 7 transfers in 1 minute
  if (type === 'transfer') {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentTransfers = await Transaction.countDocuments({
      sender: userId,
      type: 'transfer',
      timestamp: { $gte: oneMinuteAgo }
    });

    if (recentTransfers >= 7) {
      await Flag.create({
        user: userId,
        transaction: transaction._id,
        type: 'high-volume-transfer',
        message: `🚨 ${recentTransfers} transfers in the 1 minute`
      });
        //mocked mail using console.log for more than 7 trans in 1 min.
        console.log(`📧 ALERT: High-frequency transfers by ${user.email}`);
    }
  }


  // Rule 2- Amount ≥ 10,000,000
  if (transaction.amount >= 10000000) {
    await Flag.create({
      user: userId,
      transaction: transaction._id,
      type: 'large-amount',
      message: `🚨 Large transaction of ₹${transaction.amount}`
    });
    //mocked mail for large amount trans
    console.log(`📧 ALERT: Large transaction by ${user.email} — ₹${transaction.amount}`);
  }
};

module.exports = checkFraudRules;
