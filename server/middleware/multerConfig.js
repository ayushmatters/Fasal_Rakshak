const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '..', 'uploads')
try {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
  console.log('✓ Uploads directory ready:', uploadDir)
} catch (err) {
  console.warn('✗ Could not create/verify uploads directory:', err.message)
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, name)
  }
})

const fileFilter = (req, file, cb) => {
  // Accept images and video for demo
  const allowed = /jpeg|jpg|png|gif|mp4|mov/
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.test(ext)) cb(null, true)
  else cb(null, false)
}

const upload = multer({ storage, fileFilter })

module.exports = upload
