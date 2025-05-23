const mongoose = require('mongoose'); 
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const checkFraudRules = require('../utils/fraudCheck');

const BONUS_RATIO = 150; // 150 currency=1 bonus

//deposite money
exports.depositMoney = async (req, res) => {
  const { amount, currency = 'INR' } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than 0' });
  }

  const currentBalance = req.user.balances.get(currency) || 0;
  req.user.balances.set(currency, currentBalance + amount);



  const bonusGems = Math.floor(amount / BONUS_RATIO);
  if (bonusGems > 0) {
    const currentGems = req.user.bonuses.get('GEMS') || 0;
    req.user.bonuses.set('GEMS', currentGems + bonusGems);
  }

  await req.user.save();

 
  await Transaction.create({
    sender: null,
    receiver: req.user._id,
    amount,
    currency,
    type: 'deposit',
    metadata: { method: 'manual-deposit' }
  });

  
  if (bonusGems > 0) {
    await Transaction.create({
      sender: null,
      receiver: req.user._id,
      amount: bonusGems,
      currency: 'GEMS',
      type: 'bonus-gems',
      metadata: { reason: 'GEMS reward for deposit' }
    });
  }

  res.json({
    message: 'Deposit successful',
    newBalance: req.user.balances.get(currency),
    bonusGems: bonusGems
  });
};


//withdraw

exports.withdrawMoney = async (req, res) => {
  const { amount, currency = 'INR' } = req.body;

  const currentBalance = req.user.balances.get(currency) || 0;
  if (!amount || amount <= 0 || amount > currentBalance) {
    return res.status(400).json({ message: 'Invalid amount or insufficient funds' });
  }

  // Deduct amount
  req.user.balances.set(currency, currentBalance - amount);
  await req.user.save();


  const createdTxn = await Transaction.create({
    sender: req.user._id,
    receiver: null,
    amount,
    currency,
    type: 'withdraw',
    metadata: { method: 'manual-withdrawal' }
  });

  // check fraud
  await checkFraudRules({
    user: req.user,
    transaction: createdTxn,
    type: 'withdraw'
  });

  res.json({
    message: 'Withdraw successful',
    newBalance: req.user.balances.get(currency)
  });
};



//tranfer

exports.transferMoney = async (req, res) => {
  const { email, amount, currency = 'INR' } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than 0' });
  }

  const receiver = await User.findOne({ email });
  if (!receiver || receiver._id.equals(req.user._id)) {
    return res.status(400).json({ message: 'Invalid receiver' });
  }

  const senderBalance = req.user.balances.get(currency) || 0;
  if (amount > senderBalance) {
    return res.status(400).json({ message: 'Insufficient funds' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const receiverBalance = receiver.balances.get(currency) || 0;

    req.user.balances.set(currency, senderBalance - amount);
    receiver.balances.set(currency, receiverBalance + amount);

    await req.user.save({ session });
    await receiver.save({ session });

   
    const [createdTxn] = await Transaction.create([{
      sender: req.user._id,
      receiver: receiver._id,
      amount,
      currency,
      type: 'transfer',
      metadata: { description: 'Peer-to-peer transfer' }
    }], { session });

    await session.commitTransaction();
    session.endSession();

   //check fraud
    await checkFraudRules({
      user: req.user,
      transaction: createdTxn,
      type: 'transfer'
    });

    res.json({ message: 'Transfer successful' });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Transfer failed:', err.message);
    res.status(500).json({ message: 'Transfer failed. Rolled back.' });
  }
};



// history
exports.getTransactionHistory = async (req, res) => {
  try {
  
    const userId = req.user._id;

    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
    .sort({ timestamp: -1 }) 
    .populate('sender', 'name email')
    .populate('receiver', 'name email');

    res.status(200).json({ transactions });
  } catch (err) {
    console.error("Error fetching transactions:", err.message);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};


