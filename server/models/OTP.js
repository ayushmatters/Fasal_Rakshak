const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
	email: { type: String, required: true, lowercase: true, trim: true },
	otp: { type: String, required: true },
	// Optional: temporarily store user metadata until verification completes
	name: { type: String },
	password: { type: String }, // NOTE: stored temporarily; hashed on verification
	createdAt: { type: Date, default: Date.now },
	expiresAt: { type: Date }
})

module.exports = mongoose.model('OTP', otpSchema)
