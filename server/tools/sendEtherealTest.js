/*
  Dev helper: create an Ethereal account and send a sample OTP email using the
  same template as the app. Prints the Ethereal preview URL to the console.

  Usage (from repo root):
    node server/tools/sendEtherealTest.js

  This file is for local development only. Do NOT use Ethereal in production.
*/
const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

;(async () => {
  try {
    console.log('Creating Ethereal test account...')
    const testAccount = await nodemailer.createTestAccount()

    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    })

    const rawOtp = crypto.randomInt(100000, 999999).toString()
    const tplPath = path.join(__dirname, '..', 'templates', 'otpEmail.html')
    let html = `<p>Your OTP is <strong>${rawOtp}</strong></p>`
    try { html = fs.readFileSync(tplPath, 'utf8').replace('{{OTP}}', rawOtp).replace('{{VERIFICATION_LINK}}', 'http://localhost:5173/verify-otp') } catch (e) {}

    const info = await transporter.sendMail({
      from: 'Fasal Rakshak <no-reply@example.com>',
      to: 'dev+ethereal@example.com',
      subject: 'Ethereal test: your OTP',
      html
    })

    console.log('Message sent, id=', info.messageId)
    const preview = nodemailer.getTestMessageUrl(info)
    if (preview) console.log('Preview URL:', preview)
    else console.log('No preview URL available. Info:', info)
  } catch (err) {
    console.error('Failed to send ethereal test email:', err)
    process.exit(1)
  }
})()
