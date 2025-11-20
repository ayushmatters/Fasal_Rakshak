const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, default: 0 },
  imageUrl: { type: String },
  vendor: { type: String },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Product', productSchema)
