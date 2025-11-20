const express = require('express')
const router = express.Router()
const { list, create } = require('../controllers/productController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', list)
router.post('/', protect, create)

module.exports = router
