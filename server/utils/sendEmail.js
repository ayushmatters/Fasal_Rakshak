/**
 * sendEmail.js
 * Simple wrapper around nodemailer using Gmail SMTP.
 * Exports `sendEmail(options)` which returns { ok, messageId, requestId, error }
 */
const nodemailer = require('nodemailer')

let transporter = null

const ensureTransporter = () => {
  if (transporter) return transporter
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS
  if (!user || !pass) {
    throw new Error('Missing EMAIL_USER or EMAIL_PASS environment variables')
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  })

  // Verify once (best effort). Caller will see sendMail errors if this fails.
  transporter.verify().then(() => {
    console.log('[EMAIL] Transporter verified (gmail)')
  }).catch((err) => {
    console.warn('[EMAIL] Transporter verification failed:', err && err.message)
  })

  return transporter
}

const generateRequestId = () => {
  const t = Date.now().toString(36)
  const r = Math.random().toString(36).slice(2, 8)
  return `${t}-${r}`
}

/**
 * Send an email using Gmail transporter.
 * `options` follows nodemailer `sendMail` options (from, to, subject, text, html)
 */
const sendEmail = async (options = {}) => {
  const requestId = generateRequestId()
  try {
    const tr = ensureTransporter()
    const info = await tr.sendMail(options)
    return { ok: true, messageId: info.messageId, requestId }
  } catch (err) {
    return { ok: false, error: err.message || String(err), requestId }
  }
}

module.exports = { sendEmail }
