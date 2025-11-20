const mongoose = require('mongoose')

const scanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  imageUrl: { type: String, required: true },
  result: { type: Object, default: null },
  status: { type: String, enum: ['processing', 'complete'], default: 'processing' },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Scan', scanSchema)
