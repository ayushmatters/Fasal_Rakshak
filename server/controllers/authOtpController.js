const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const User = require('../models/User')
const { sendEmail, generateRequestId } = require('../config/emailTransporter')
const { logEmailSend } = require('../middleware/emailLogger')

// Helper: sign JWT (7d)
const signToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })

// Load email template (sync, small file) and replace placeholders
const loadTemplate = (otp, link) => {
  try {
    const tpl = fs.readFileSync(path.join(__dirname, '..', 'templates', 'otpEmail.html'), 'utf8')
    return tpl.replace('{{OTP}}', otp).replace('{{VERIFICATION_LINK}}', link)
  } catch (e) {
    return `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`
  }
}

// Rate limiting helpers (in-memory for demo; use Redis in prod)
const ipSignupAttempts = new Map() // ip -> { count, firstAt }
const IP_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_SIGNUPS_PER_IP = 10

const recordIpAttempt = (ip) => {
  const now = Date.now()
  const rec = ipSignupAttempts.get(ip) || { count: 0, firstAt: now }
  if (now - rec.firstAt > IP_WINDOW_MS) rec.count = 0, rec.firstAt = now
  rec.count += 1
  ipSignupAttempts.set(ip, rec)
  return rec.count
}

exports.signup = async (req, res, next) => {
  const requestId = generateRequestId()
  try {
    const { name, email, password } = req.body
    const ip = req.ip || req.connection?.remoteAddress || 'unknown'
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, message: 'Missing fields' })
    }

    // Rate-limit by IP
    const attempts = recordIpAttempt(ip)
    if (attempts > MAX_SIGNUPS_PER_IP) {
      return res.status(429).json({ ok: false, message: 'Too many signup attempts from this IP', requestId })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ ok: false, message: 'Email already in use' })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create user as unverified
    const user = await User.create({ name, email, password: passwordHash, isVerified: false })

    // Generate OTP and store hashed version
    const rawOtp = crypto.randomInt(100000, 999999).toString()
    const otpHash = await bcrypt.hash(rawOtp, 10)
    const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10)
    user.otpHash = otpHash
    user.otpExpiresAt = new Date(Date.now() + expireMinutes * 60 * 1000)
    user.otpAttempts = 0
    user.otpResendCount = 0
    user.otpSendAttempts = 1
    await user.save()

    // Send OTP email synchronously (wait for result before responding)
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-otp?email=${encodeURIComponent(user.email)}`
    const html = loadTemplate(rawOtp, verificationLink)
    const text = `Your Fasal Rakshak OTP is: ${rawOtp}. It expires in ${expireMinutes} minutes.`

    console.log(`[SIGNUP] [${requestId}] Sending OTP to ${email}`)
    const emailResult = await sendEmail({
      from: process.env.EMAIL_FROM || 'no-reply@fasal-rakshak.local',
      to: user.email,
      subject: 'Your Fasal Rakshak OTP',
      html,
      text
    })

    // Log email send attempt
    logEmailSend({
      requestId: emailResult.requestId || requestId,
      to: user.email,
      subject: 'Your Fasal Rakshak OTP',
      messageId: emailResult.messageId,
      previewUrl: emailResult.previewUrl,
      success: emailResult.ok,
      error: emailResult.error
    })

    // If email send failed, return error
    if (!emailResult.ok) {
      console.error(`[SIGNUP] [${requestId}] Email send failed: ${emailResult.error}`)
      // Update user with error tracking
      user.emailSendLastError = emailResult.error
      user.otpSendAttempts = (user.otpSendAttempts || 0) + 1
      await user.save()

      return res.status(502).json({
        ok: false,
        message: 'Failed to send OTP email',
        reason: emailResult.error,
        requestId: emailResult.requestId || requestId
      })
    }

    // Success: OTP email was sent
    console.log(`[SIGNUP] [${requestId}] ✓ OTP email sent successfully to ${email}`)
    user.messageId = emailResult.messageId
    if (emailResult.previewUrl) {
      user.previewUrl = emailResult.previewUrl
    }
    await user.save()

    return res.status(201).json({
      ok: true,
      message: 'OTP sent to email',
      userId: user._id,
      requestId: emailResult.requestId || requestId
    })
  } catch (err) {
    console.error(`[SIGNUP] [${requestId}] Error:`, err)
    next(err)
  }
}

exports.verifyOtp = async (req, res, next) => {
  try {
    const { userId, email, otp } = req.body
    if ((!userId && !email) || !otp) {
      return res.status(400).json({ ok: false, message: 'Missing fields' })
    }

    const user = userId ? await User.findById(userId) : await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ ok: false, message: 'User not found' })
    }

    if (user.isVerified) {
      return res.status(400).json({ ok: false, message: 'Email already verified' })
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ ok: false, message: 'No OTP requested' })
    }

    if (user.otpAttempts >= 5) {
      return res.status(429).json({ ok: false, message: 'Too many OTP attempts' })
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ ok: false, message: 'OTP expired' })
    }

    const match = await bcrypt.compare(otp.toString(), user.otpHash)
    if (!match) {
      user.otpAttempts = (user.otpAttempts || 0) + 1
      await user.save()
      const attemptsLeft = Math.max(0, 5 - user.otpAttempts)
      return res.status(400).json({ ok: false, message: 'Invalid OTP', attemptsLeft })
    }

    // Successful verification: mark verified, clear OTP fields, issue token
    user.isVerified = true
    user.otpHash = undefined
    user.otpExpiresAt = undefined
    user.otpAttempts = 0
    user.otpResendCount = 0
    await user.save()

    const token = signToken(user)
    return res.json({
      ok: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    })
  } catch (err) {
    next(err)
  }
}

exports.resendOtp = async (req, res, next) => {
  const requestId = generateRequestId()
  try {
    const { userId, email } = req.body
    if (!userId && !email) {
      return res.status(400).json({ ok: false, message: 'Missing fields' })
    }

    const user = userId ? await User.findById(userId) : await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ ok: false, message: 'User not found' })
    }

    if (user.isVerified) {
      return res.status(400).json({ ok: false, message: 'Email already verified' })
    }

    // Limit resend count per user
    if ((user.otpResendCount || 0) >= 3) {
      return res.status(429).json({ ok: false, message: 'Resend limit reached' })
    }

    // Also basic per-IP rate cap
    const ip = req.ip || req.connection?.remoteAddress || 'unknown'
    const attempts = recordIpAttempt(ip)
    if (attempts > MAX_SIGNUPS_PER_IP) {
      return res.status(429).json({ ok: false, message: 'Too many requests from this IP', requestId })
    }

    // Generate new OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString()
    user.otpHash = await bcrypt.hash(rawOtp, 10)
    const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10)
    user.otpExpiresAt = new Date(Date.now() + expireMinutes * 60 * 1000)
    user.otpAttempts = 0
    user.otpResendCount = (user.otpResendCount || 0) + 1
    user.otpSendAttempts = (user.otpSendAttempts || 0) + 1
    await user.save()

    // Send OTP email synchronously
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-otp?email=${encodeURIComponent(user.email)}`
    const html = loadTemplate(rawOtp, verificationLink)
    const text = `Your Fasal Rakshak OTP is: ${rawOtp}. It expires in ${expireMinutes} minutes.`

    console.log(`[RESEND-OTP] [${requestId}] Sending OTP to ${user.email}`)
    const emailResult = await sendEmail({
      from: process.env.EMAIL_FROM || 'no-reply@fasal-rakshak.local',
      to: user.email,
      subject: 'Your Fasal Rakshak OTP (Resend)',
      html,
      text
    })

    // Log email send attempt
    logEmailSend({
      requestId: emailResult.requestId || requestId,
      to: user.email,
      subject: 'Your Fasal Rakshak OTP (Resend)',
      messageId: emailResult.messageId,
      previewUrl: emailResult.previewUrl,
      success: emailResult.ok,
      error: emailResult.error
    })

    // If email send failed, return error
    if (!emailResult.ok) {
      console.error(`[RESEND-OTP] [${requestId}] Email send failed: ${emailResult.error}`)
      user.emailSendLastError = emailResult.error
      await user.save()

      return res.status(502).json({
        ok: false,
        message: 'Failed to resend OTP email',
        reason: emailResult.error,
        requestId: emailResult.requestId || requestId
      })
    }

    // Success: OTP email was resent
    console.log(`[RESEND-OTP] [${requestId}] ✓ OTP email resent successfully to ${user.email}`)
    user.messageId = emailResult.messageId
    if (emailResult.previewUrl) {
      user.previewUrl = emailResult.previewUrl
    }
    await user.save()

    return res.json({
      ok: true,
      message: 'OTP resent to email',
      requestId: emailResult.requestId || requestId
    })
  } catch (err) {
    console.error(`[RESEND-OTP] [${requestId}] Error:`, err)
    next(err)
  }
}

// Modified login to block unverified users
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' })
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })
    // Block login if not verified
    if (!user.isVerified) return res.status(403).json({ message: 'Email not verified' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ message: 'Invalid credentials' })
    const token = signToken(user)
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) { next(err) }
}

module.exports = exports

// Security notes (comments):
// - OTP values are hashed with bcrypt before storage so plaintext OTP is never saved.
// - OTPs expire after OTP_EXPIRE_MINUTES (default 10).
// - OTP attempts and resend counts are tracked to mitigate brute-force.
// - For production, move in-memory rate-limits and IP counters to Redis or similar.