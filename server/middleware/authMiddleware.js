const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { _tokenBlacklist } = require('../controllers/authController')

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    // Check if token is blacklisted
    if (_tokenBlacklist && _tokenBlacklist.has(token)) {
      return res.status(401).json({ message: 'Token invalid' })
    }
    req.user = await User.findById(decoded.id).select('-password')
    return next()
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid' })
  }
}
