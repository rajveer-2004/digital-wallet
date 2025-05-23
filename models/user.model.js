const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },

  balances: {
    type: Map,
    of: Number,
    default: () => new Map([['INR', 0]])
  },


  bonuses: {
    type: Map,
    of: Number,
    default: () => new Map([['GEMS', 0], ['COINS', 0]])
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  avatarUrl: String,
  phone: String,
   
  isAdmin: { type: Boolean, default: false },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

//hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});


// compare password
UserSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
