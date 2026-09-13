const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  brainScore: {
    type: Number,
    default: 500, // starting ELO-like score
  },
  skillProfile: {
    memory: { type: Number, default: 50 },
    attention: { type: Number, default: 50 },
    speed: { type: Number, default: 50 },
    logic: { type: Number, default: 50 },
    pattern: { type: Number, default: 50 },
    math: { type: Number, default: 50 },
    spatial: { type: Number, default: 50 },
    verbal: { type: Number, default: 50 },
  },
  streak: {
    current: { type: Number, default: 0 },
    best: { type: Number, default: 0 },
    lastActive: { type: Date },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
