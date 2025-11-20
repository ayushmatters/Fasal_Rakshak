const jwt = require('jsonwebtoken')
const { _tokenBlacklist } = require('./authController')

// Deprecated: authController previously contained signup/login logic.
// The OTP-capable implementations are in authOtpController.

// Simple in-memory token blacklist for logout (dev only). This is not persisted.
const tokenBlacklist = new Set()

exports.logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      tokenBlacklist.add(token)
    }
    return res.json({ message: 'Logged out' })
  } catch (err) { next(err) }
}

exports._tokenBlacklist = tokenBlacklist

exports.me = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' })
    return res.json(req.user)
  } catch (err) { next(err) }
}
