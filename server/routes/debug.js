/**
 * Debug routes for email testing and server diagnostics
 */
const express = require('express')
const router = express.Router()
const { getTransporter, getTransporterStatus, sendEmail, generateRequestId } = require('../config/emailTransporter')
const { logEmailSend, getEmailLogs, getEmailLogById } = require('../middleware/emailLogger')

/**
 * GET /api/debug/test-email?to=user@example.com
 * Test email sending and return transporter status + message preview
 */
router.get('/test-email', async (req, res) => {
  try {
    const { to } = req.query
    if (!to) {
      return res.status(400).json({ ok: false, error: 'Missing ?to=email parameter' })
    }

    const status = getTransporterStatus()
    if (!status.verified) {
      return res.status(503).json({ ok: false, error: 'Email transporter not available', transporter: status })
    }

    const testOtp = '123456' // Dummy OTP for test
    const requestId = generateRequestId()
    const html = `
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background: #f6fbfb; color: #0f172a;">
          <div style="max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 6px 18px rgba(6,8,17,0.08);">
            <h2 style="margin: 0 0 8px 0;">Fasal Rakshak — Test Email</h2>
            <p style="color: #64748b; font-size: 13px;">This is a test email to verify email transporter is working correctly.</p>
            <div style="display: block; margin: 20px auto; font-size: 28px; letter-spacing: 6px; font-weight: 700; background: linear-gradient(90deg, #06b6d4, #34d399); color: #fff; width: 180px; text-align: center; padding: 12px 0; border-radius: 8px;">
              ${testOtp}
            </div>
            <p style="color: #64748b; font-size: 13px; margin: 20px 0;">
              <strong>Request ID:</strong> ${requestId}<br/>
              <strong>Test Time:</strong> ${new Date().toISOString()}
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0;" />
            <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
              ✓ Email transporter is working correctly.<br/>
              This is a development test email. You can safely ignore it.
            </p>
          </div>
        </body>
      </html>
    `

    const result = await sendEmail({
      from: process.env.EMAIL_FROM || 'no-reply@fasal-rakshak.local',
      to,
      subject: '[TEST] Fasal Rakshak Email Transporter Verification',
      html,
      text: `Test email - Request ID: ${requestId}`
    })

    logEmailSend({
      requestId: result.requestId || requestId,
      to,
      subject: '[TEST] Email transporter verification',
      messageId: result.messageId,
      previewUrl: result.previewUrl,
      success: result.ok,
      error: result.error
    })

    if (!result.ok) {
      return res.status(502).json({
        ok: false,
        error: result.error,
        requestId: result.requestId,
        transporter: status
      })
    }

    return res.json({
      ok: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      previewUrl: result.previewUrl,
      requestId: result.requestId,
      transporter: { ethereal: status.ethereal, verified: status.verified }
    })
  } catch (err) {
    console.error('[DEBUG] test-email error:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
})

/**
 * GET /api/debug/transporter-status
 * Return current email transporter status and verification state
 */
router.get('/transporter-status', (req, res) => {
  const status = getTransporterStatus()
  res.json({
    verified: status.verified,
    ethereal: status.ethereal,
    error: status.error,
    timestamp: new Date().toISOString()
  })
})

/**
 * Simple ping endpoint to check server reachability and origin header
 */
router.get('/ping', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString(), origin: req.headers.origin || null })
})

/**
 * GET /api/debug/email-logs?limit=20
 * Retrieve email send logs (dev/debug only)
 */
router.get('/email-logs', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100)
  const logs = getEmailLogs(limit)
  res.json({ logs, count: logs.length })
})

/**
 * GET /api/debug/email-log/:requestId
 * Retrieve specific email log by request ID
 */
router.get('/email-log/:requestId', (req, res) => {
  const log = getEmailLogById(req.params.requestId)
  if (!log) {
    return res.status(404).json({ ok: false, error: 'Log not found' })
  }
  res.json(log)
})

/**
 * GET /api/debug/user?email=... or /api/debug/user?id=...
 * Development-only helper to view a user's document (redacts password)
 */
router.get('/user', async (req, res) => {
  try {
    const { email, id } = req.query
    if (!email && !id) return res.status(400).json({ ok: false, error: 'Provide ?email= or ?id=' })
    // require model dynamically to avoid circular dependency issues in some setups
    const User = require('../models/User')
    let user = null
    if (id) user = await User.findById(id).lean()
    else user = await User.findOne({ email }).lean()
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' })
    // redact sensitive fields but keep OTP metadata for debugging
    if (user.password) delete user.password
    // Keep otpHash only if present but do not expose full hash in production
    // (this is dev-only; ensure this route is not enabled in production)
    return res.json({ ok: true, user })
  } catch (err) {
    console.error('[DEBUG] /user error:', err)
    return res.status(500).json({ ok: false, error: err.message })
  }
})

module.exports = router
