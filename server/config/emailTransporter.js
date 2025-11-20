/**
 * Email transporter configuration with Ethereal fallback for development
 * Initializes nodemailer and verifies SMTP connection on startup
 */
const nodemailer = require('nodemailer')

let transporter = null
let transporterStatus = { verified: false, error: null, ethereal: false }
let runtimeConfig = { emailEnabled: false }

/**
 * Initialize email transporter
 * - Uses SMTP env vars if provided (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE)
 * - Falls back to Ethereal test account in development if env vars missing
 * - Returns { transporter, status: { verified, ethereal, error } }
 */
const initTransporter = async () => {
  try {
    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS

    if (hasSmtpConfig) {
      // Use provided SMTP credentials
      console.log('[EMAIL] Initializing SMTP transporter...')
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
      transporterStatus.ethereal = false
    } else {
      // Create Ethereal test account for development
      console.log('[EMAIL] Creating Ethereal test account for development...')
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      })
      transporterStatus.ethereal = true
      console.log('[EMAIL] Ethereal test account created')
      console.log(`[EMAIL] Ethereal credentials (dev only):`)
      console.log(`       User: ${testAccount.user}`)
      console.log(`       Pass: ${testAccount.pass}`)
      console.log(`       Link: https://ethereal.email`)
    }

    // Verify transporter connection
    await transporter.verify()
    transporterStatus.verified = true
    transporterStatus.error = null
    runtimeConfig.emailEnabled = true
    console.log('[EMAIL] ✓ Transporter verified successfully')
    return { transporter, status: transporterStatus }
  } catch (err) {
    const errorMsg = `Transporter verification failed: ${err.message}`
    console.error(`[EMAIL] ✗ ${errorMsg}`)
    transporterStatus.verified = false
    transporterStatus.error = errorMsg
    runtimeConfig.emailEnabled = false
    // Continue without crashing; email sends will fail gracefully
    return { transporter: null, status: transporterStatus }
  }
}

/**
 * Get current transporter (must call initTransporter first)
 */
const getTransporter = () => transporter

/**
 * Get current transporter status
 */
const getTransporterStatus = () => transporterStatus

/**
 * Check if email is enabled (transporter verified)
 */
const isEmailEnabled = () => runtimeConfig.emailEnabled

/**
 * Wrapper to send email with automatic retry and error handling
 */
const sendEmail = async (options, retryCount = 0) => {
  const requestId = generateRequestId()

  if (!transporter) {
    const error = 'Email transporter not initialized'
    console.error(`[EMAIL] [${requestId}] ✗ ${error}`)
    return { ok: false, error, requestId }
  }

  try {
    console.log(`[EMAIL] [${requestId}] Sending email to: ${options.to}`)
    const info = await transporter.sendMail(options)
    console.log(`[EMAIL] [${requestId}] ✓ Email sent, messageId: ${info.messageId}`)

    const response = { ok: true, messageId: info.messageId, requestId }

    // Add Ethereal preview URL if available
    if (transporterStatus.ethereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      if (previewUrl) {
        response.previewUrl = previewUrl
        console.log(`[EMAIL] [${requestId}] Preview: ${previewUrl}`)
      }
    }

    return response
  } catch (err) {
    const errorMsg = err.message || 'Unknown error'
    console.error(`[EMAIL] [${requestId}] ✗ Attempt ${retryCount + 1} failed: ${errorMsg}`)

    // Retry once on transient errors
    if (retryCount === 0 && isTransientError(err)) {
      console.log(`[EMAIL] [${requestId}] Retrying after 500ms...`)
      await new Promise((resolve) => setTimeout(resolve, 500))
      return sendEmail(options, retryCount + 1)
    }

    return { ok: false, error: errorMsg, requestId, retries: retryCount }
  }
}

/**
 * Determine if error is transient (retry-worthy)
 */
const isTransientError = (err) => {
  const transientCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENOTFOUND']
  return transientCodes.includes(err.code) || err.message.includes('SMTP')
}

/**
 * Generate request ID for correlation logging
 */
const generateRequestId = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  return `${timestamp}-${random}`
}

module.exports = {
  initTransporter,
  getTransporter,
  getTransporterStatus,
  isEmailEnabled,
  sendEmail,
  generateRequestId
}
