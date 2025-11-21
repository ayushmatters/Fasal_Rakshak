/**
 * Server entry point for Fasal Rakshak backend
 */
const path = require('path')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')

dotenv.config()

// Print safe startup info to help debug dev environment mismatches
const logStartupInfo = () => {
  try {
    const port = process.env.PORT || '5000'
    const frontend = process.env.FRONTEND_URL || 'not set'
    const nodeEnv = process.env.NODE_ENV || 'development'
    const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
    console.log('--- Startup info ---')
    console.log('NODE_ENV:', nodeEnv)
    console.log('Server will use PORT:', port)
    console.log('FRONTEND_URL:', frontend)
    console.log('SMTP configured:', smtpConfigured)
    console.log('---------------------')
  } catch (e) {
    console.warn('Failed to print startup info', e && e.message)
  }
}

logStartupInfo()

const connectDB = require('./config/db')
const { initTransporter } = require('./config/emailTransporter')

// Connect to DB (async, non-blocking)
connectDB().catch((err) => {
  console.error('Database connection failed, but server will start anyway')
})

// Initialize email transporter (async, non-blocking)
initTransporter().catch((err) => {
  console.error('Email transporter initialization error (non-fatal):', err.message)
})

const app = express()

// Middlewares
// CORS: allow local dev frontends. In production, lock this down to your real origin.
app.use(cors({
  origin: (origin, cb) => {
    // allow non-browser requests (e.g. curl) where origin is undefined
    if (!origin) return cb(null, true)
    // allow common local dev origins (localhost and 127.0.0.1) or explicit FRONTEND_URL
    try {
      const isLocalhost = typeof origin === 'string' && (origin.includes('localhost') || origin.includes('127.0.0.1'))
      const isFrontendMatch = origin === process.env.FRONTEND_URL
      if (isLocalhost || isFrontendMatch) {
        return cb(null, true)
      }
    } catch (e) {
      // fall through to deny
    }
    return cb(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(morgan('dev'))

// In dev, log incoming requests with origin for easier CORS debugging
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const origin = req.headers.origin || 'none'
    // Log concise request info and for OPTIONS preflight show headers
    if (req.method === 'OPTIONS') {
      console.debug('[req] PRELIGHT:', req.method, req.originalUrl, 'Origin:', origin, 'Access-Control-Request-Method:', req.headers['access-control-request-method'])
    } else {
      console.debug('[req]', req.method, req.originalUrl, 'Origin:', origin)
    }
    return next()
  })
}

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' })
})

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/scan', require('./routes/scan'))
app.use('/api/products', require('./routes/products'))
app.use('/api/community', require('./routes/community'))

// Debug routes (for email testing and diagnostics)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/debug', require('./routes/debug'))
}

// Error handler (last)
const { errorHandler } = require('./middleware/errorHandler')
app.use(errorHandler)

const PORT = parseInt(process.env.PORT, 10) || 5000

// Try to start server on PORT, if EADDRINUSE then try next port up to a limit
const MAX_PORT_ATTEMPTS = 5
let attempts = 0

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && attempts < MAX_PORT_ATTEMPTS) {
      attempts += 1
      const nextPort = port + 1
      console.warn(`Port ${port} in use, trying port ${nextPort} (attempt ${attempts}/${MAX_PORT_ATTEMPTS})`)
      // attempt to listen on the next port
      startServer(nextPort)
    } else {
      console.error('Server error:', err)
      process.exit(1)
    }
  })
}

startServer(PORT)

