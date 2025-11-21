const mongoose = require('mongoose')
const path = require('path')
const bcrypt = require('bcryptjs')

const userId = process.argv[2]
const otpPlain = process.argv[3] || '123456'
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/fasal_rakshak'

if (!userId) {
  console.error('Usage: node tools/setOtp.js <userId> [otp]')
  process.exit(2)
}

const run = async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    const User = require(path.join(__dirname, '..', 'models', 'User'))
    const otpHash = await bcrypt.hash(otpPlain, 10)
    const expireMinutes = 10
    const otpExpiresAt = new Date(Date.now() + expireMinutes * 60 * 1000)
    const u = await User.findByIdAndUpdate(userId, {
      otpHash,
      otpExpiresAt,
      otpAttempts: 0,
      otpResendCount: 0
    }, { new: true })
    if (!u) {
      console.error('User not found:', userId)
      process.exit(1)
    }
    console.log('Updated user OTP for', userId)
    console.log('Use OTP:', otpPlain, ' (expires at:', otpExpiresAt.toISOString(), ')')
    await mongoose.disconnect()
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err)
    process.exit(1)
  }
}

run()
