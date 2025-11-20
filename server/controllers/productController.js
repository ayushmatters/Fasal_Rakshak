const Product = require('../models/Product')

exports.list = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(50)
    return res.json(products)
  } catch (err) {
    // If DB is not available during dev, return an empty list instead of erroring
    console.error('Product list error:', err.message)
    return res.json([])
  }
}

exports.create = async (req, res, next) => {
  try {
    const { name, description, price, imageUrl, vendor } = req.body
    const p = await Product.create({ name, description, price, imageUrl, vendor })
    return res.status(201).json(p)
  } catch (err) { next(err) }
}
