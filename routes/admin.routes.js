const express = require('express');
const router = express.Router();

// Middleware: Check if user is logged in and is an admin
const protect = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/isAdmin.middleware');

// Controller functions
const {
  getFlags,
  getTotalBalances,
  getTopUsers,
  softDeleteUser,
  softDeleteTransaction,
} = require('../controllers/admin.controller');


// Get all flagged transactions
router.get('/threat', protect, isAdmin, getFlags);

// Get total wallet balances of all users
router.get('/total-money', protect, isAdmin, getTotalBalances);

//Get top users by balance or transaction volume
router.get('/top-spenders', protect, isAdmin, getTopUsers);




module.exports = router;
