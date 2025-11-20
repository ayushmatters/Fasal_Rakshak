const express = require('express')
const router = express.Router()
const upload = require('../middleware/multerConfig')
const { protect } = require('../middleware/authMiddleware')
const { upload: uploadController, process: processController, getScan } = require('../controllers/scanController')

// Upload endpoint (protected)
router.post('/upload', protect, upload.single('image'), uploadController)

// Start processing (demo)
router.post('/process/:id', protect, processController)

router.get('/:id', protect, getScan)

module.exports = router
