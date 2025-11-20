/**
 * Server entry point for Fasal Rakshak backend
 */
const path = require('path')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')

dotenv.config()

const connectDB = require('./config/db')

// Connect to DB (async, non-blocking)
connectDB().catch((err) => {
  console.error('Database connection failed, but server will start anyway')
})

const app = express()

// Middlewares
// CORS: allow local dev frontends. In production, lock this down to your real origin.
app.use(cors({
  origin: (origin, cb) => {
    // allow non-browser requests (e.g. curl) where origin is undefined
    if (!origin) return cb(null, true)
    // allow any localhost origin during development (Vite may pick different ports)
    if (origin.includes('localhost') || origin === process.env.FRONTEND_URL) return cb(null, true)
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
    console.debug('[req]', req.method, req.originalUrl, 'Origin:', req.headers.origin || 'none')
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
