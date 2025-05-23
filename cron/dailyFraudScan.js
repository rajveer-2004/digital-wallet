const cron = require('node-cron');
const Transaction = require('../models/transaction.model');
const Flag = require('../models/flag.model');

const dailyFraudScan = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log("Running daily fraud scan...");

    const transactions = await Transaction.find({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    for (let txn of transactions) {
      if (txn.amount >= 10000000) {
        await Flag.create({
          user: txn.sender,
          transaction: txn._id,
          type: 'daily-scan-large-amount',
          message: `Daily scan found large transaction: ₹${txn.amount}`
        });

        //mocked mail 
        console.log(`📧 [DAILY SCAN ALERT] Large transaction flagged for user: ${txn.sender}`);
      }
    }

    console.log("✅ Daily fraud scan complete");
  });
};

module.exports = dailyFraudScan;
