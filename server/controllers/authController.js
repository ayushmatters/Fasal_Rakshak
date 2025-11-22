/**
 * authController.js
 * Implements signup -> create OTP, send email (Gmail), and verifyOtp -> create final user
 * Important: to recreate a missing 'otps' collection in MongoDB we use:
 *   await OTP.create({ email, otp })
 * That exact call will cause Mongoose to create the `otps` collection automatically
 * when the first document is inserted.
 */

const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const OTP = require('../models/OTP')
const { sendEmail } = require('../utils/sendEmail')

// Simple in-memory token blacklist for logout (dev only)
const tokenBlacklist = new Set()

const signToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })

// Helper to create a 6-digit OTP
const makeOtp = () => String(100000 + Math.floor(Math.random() * 900000))

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ ok: false, message: 'Missing fields' })

    // Don't allow duplicate final users
    const existing = await User.findOne({ email: String(email).toLowerCase() })
    if (existing) return res.status(400).json({ ok: false, message: 'Email already registered' })

    // Generate OTP
    const rawOtp = makeOtp()
    const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10)
    const expiresAt = new Date(Date.now() + expireMinutes * 60 * 1000)

    // CRITICAL: create OTP document (this will recreate the `otps` collection if it was deleted)
    // The user specifically requested this exact call:
    await OTP.create({ email: String(email).toLowerCase(), otp: rawOtp })

    // Store additional signup metadata on the OTP document so we can create the final user
    // only after the OTP is verified. We store the plaintext password temporarily here
    // because the user requested password hashing to occur at verification time.
    await OTP.findOneAndUpdate(
      { email: String(email).toLowerCase() },
      { name: String(name), password: String(password), expiresAt },
      { sort: { createdAt: -1 } }
    )

    // Send OTP email via Gmail transporter (must be configured via env vars)
    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173'
    const html = `<p>Your Fasal Rakshak OTP is <strong>${rawOtp}</strong>. It expires in ${expireMinutes} minutes.</p><p>Or open: <a href="${frontend}/verify-otp?email=${encodeURIComponent(email)}">Verify OTP</a></p>`
    const text = `Your OTP is ${rawOtp}. It expires in ${expireMinutes} minutes.`

    // IMPORTANT: await the sendEmail call so the endpoint only returns after email is dispatched
    const emailResult = await sendEmail({ from: process.env.EMAIL_FROM || process.env.EMAIL_USER, to: email, subject: 'Your Fasal Rakshak OTP', html, text })

    if (!emailResult.ok) {
      // Clean up OTP if email send failed to avoid orphaned pending registrations
      await OTP.deleteMany({ email: String(email).toLowerCase() })
      return res.status(502).json({ ok: false, message: 'Failed to send OTP email', error: emailResult.error })
    }

    return res.status(201).json({ ok: true, message: 'OTP sent to email' })
  } catch (err) {
    console.error('[SIGNUP] Error:', err)
    next(err)
  }
}

/**
 * Verify OTP and create the final user only after OTP matches.
 * We look up the OTP in the `otps` collection first; if it matches and is not expired,
 * then we hash the stored password and create the User with `isVerified: true`.
 */
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({ ok: false, message: 'Missing fields' })

    const emailLc = String(email).toLowerCase()
    // Find the most recent OTP record for this email
    const otpDoc = await OTP.findOne({ email: emailLc }).sort({ createdAt: -1 })
    if (!otpDoc) return res.status(404).json({ ok: false, message: 'No OTP requested for this email' })

    // Check expiry
    if (otpDoc.expiresAt && new Date() > otpDoc.expiresAt) {
      await OTP.deleteMany({ email: emailLc })
      return res.status(400).json({ ok: false, message: 'OTP expired' })
    }

    // Match OTP (plain equality because we saved the raw OTP)
    if (String(otp).trim() !== String(otpDoc.otp).trim()) {
      return res.status(400).json({ ok: false, message: 'Invalid OTP' })
    }

    // OTP matches -> now hash the password and create final User
    const name = otpDoc.name || 'Unnamed'
    const plainPassword = otpDoc.password || ''
    if (!plainPassword) {
      // If no password was stored with OTP, we cannot create user
      return res.status(400).json({ ok: false, message: 'Signup data missing, please signup again' })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(plainPassword, salt)

    // Create the final User with isVerified: true
    const user = await User.create({ name, email: emailLc, password: passwordHash, isVerified: true })

    // Remove OTP documents for this email
    await OTP.deleteMany({ email: emailLc })

    const token = signToken(user)
    return res.json({ ok: true, token, user: { id: String(user._id), name: user.name, email: user.email } })
  } catch (err) {
    console.error('[VERIFY-OTP] Error:', err)
    next(err)
  }
}

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
