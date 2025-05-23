const Flag = require('../models/flag.model');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');

//Get all flagged accounts
exports.getFlags = async (req, res) => {
  try {
    const flags = await Flag.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('transaction');

    res.json({ flags });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching flags', error: err.message });
  }
};

//Calculate total balance
exports.getTotalBalances = async (req, res) => {
  try {
    const users = await User.find();
    const totals = {};

    users.forEach(user => {
      for (let [currency, amount] of user.balances.entries()) {
        totals[currency] = (totals[currency] || 0) + amount;
      }
    });

    res.json({ totalBalances: totals });
  } catch (err) {
    res.status(500).json({ message: 'Error calculating balances', error: err.message });
  }
};

//top users by balance and trans count
exports.getTopUsers = async (req, res) => {
  try {
    const users = await User.find();

    const topBalances = users.map(user => ({
      name: user.name,
      email: user.email,
      totalBalance: [...user.balances.values()].reduce((a, b) => a + b, 0)
    }))
    .sort((a, b) => b.totalBalance - a.totalBalance)
    .slice(0, 5);

    const txCounts = await Transaction.aggregate([
      { $match: { sender: { $ne: null } } },
      { $group: { _id: "$sender", txCount: { $sum: 1 } } },
      { $sort: { txCount: -1 } },
      { $limit: 5 }
    ]);

    const topTxUsers = await Promise.all(txCounts.map(async tx => {
      const user = await User.findById(tx._id);
      return {
        name: user?.name || 'Unknown',
        email: user?.email || 'Unknown',
        transactionCount: tx.txCount
      };
    }));

    res.json({
      topUsersByBalance: topBalances,
      topUsersByTransactions: topTxUsers
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching top users', error: err.message });
  }
};

//Soft delete a user
exports.softDeleteUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ message: 'User soft deleted ✅' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
};

//Soft delete a transaction
exports.softDeleteTransaction = async (req, res) => {
  try {
    await Transaction.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ message: 'Transaction soft deleted ✅' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction', details: error.message });
  }
};
