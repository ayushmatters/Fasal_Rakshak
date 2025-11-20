const express = require('express')
const router = express.Router()
const { signup, login, me } = require('../controllers/authController')
// New OTP-enabled controllers
const otpCtrl = require('../controllers/authOtpController')
const { logout } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

// Use OTP-enabled signup
router.post('/signup', otpCtrl.signup)
router.post('/verify-otp', otpCtrl.verifyOtp)
router.post('/resend-otp', otpCtrl.resendOtp)
router.post('/login', otpCtrl.login)
router.post('/logout', logout)
router.get('/me', protect, me)

module.exports = router
