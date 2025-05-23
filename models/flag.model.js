const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, 
  message: String,
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Flag', flagSchema);
