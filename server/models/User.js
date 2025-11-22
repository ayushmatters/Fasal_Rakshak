const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
  // Preferred UI language for the user (frontend will switch to this on login)
  language: { type: String, default: 'en' },
  createdAt: { type: Date, default: Date.now },
  // Email verification + OTP fields
  isVerified: { type: Boolean, default: false },
  otpHash: { type: String },
  otpExpiresAt: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  otpResendCount: { type: Number, default: 0 }
})

module.exports = mongoose.model('User', userSchema)
