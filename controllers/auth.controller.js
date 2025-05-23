const User = require('../models/user.model');  
const jwt = require('jsonwebtoken');        

//Generates JWT token for auth
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },            
    process.env.JWT_SECRET,    
    { expiresIn: '1d' }   //expire in 1day
  );
};


exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //Check if the user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    //Create a new user
    const user = new User({ name, email, passwordHash: password });

    //Save the user to the database
    await user.save();

    //Send back a token
    res.status(201).json({ token: generateToken(user._id) });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  //Find user by email and ensure not soft-deleted
  const user = await User.findOne({ email, isDeleted: false });

  //If user not found or password invalid
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  //Return token
  res.json({ token: generateToken(user._id) });
};
