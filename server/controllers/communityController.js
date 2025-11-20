const Post = require('../models/Post')

exports.list = async (req, res, next) => {
  try {
    const posts = await Post.find().populate('user', 'name').sort({ createdAt: -1 }).limit(50)
    return res.json(posts)
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    const { text, imageUrl } = req.body
    const post = await Post.create({ user: req.user ? req.user._id : null, text, imageUrl })
    return res.status(201).json(post)
  } catch (err) { next(err) }
}
