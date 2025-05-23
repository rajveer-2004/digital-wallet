const express = require('express');
const router = express.Router();
//importing controller
const { registerUser, loginUser } = require('../controllers/auth.controller.js');

//This is for register
router.post('/register', registerUser);

//This is for login
router.post('/login', loginUser);

module.exports = router;
