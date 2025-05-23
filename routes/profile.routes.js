const express = require('express');
const router = express.Router();

// Middleware, verify if the user is logged in
const protect = require('../middleware/auth.middleware');

//controller logic
const { getProfile } = require('../controllers/profile.controller');

//user profile
router.get('/profile', protect, getProfile);

module.exports = router;
