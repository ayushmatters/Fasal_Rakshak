const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const signToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
}

// Simple in-memory token blacklist for logout (dev only). This is not persisted.
const tokenBlacklist = new Set()

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' })
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already in use' })
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    const user = await User.create({ name, email, password: hash })
    const token = signToken(user)
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) { next(err) }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' })
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ message: 'Invalid credentials' })
    const token = signToken(user)
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) { next(err) }
}

exports.logout = async (req, res, next) => {
  try {
    // If token provided in header, add to blacklist
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
