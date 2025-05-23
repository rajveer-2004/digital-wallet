const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive']
  },

  currency: {
    type: String,
    default: 'INR'
  },


  type: {
    type: String,
    enum: [
      'deposit', 'withdraw', 'transfer',
      'bonus-gems', 'bonus-coins', 'redeem-bonus'
    ],
    required: true
  },

  // Status
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },

  // (optional, good for fraud logs)
  metadata: {
    type: Map,
    of: String
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
