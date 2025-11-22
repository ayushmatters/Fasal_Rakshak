const Post = require('../models/Post')

exports.list = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email')
      .populate('comments')
      .sort({ createdAt: -1 })
      .limit(50)
    return res.json(posts)
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    const { title, body, imageUrl } = req.body
    
    // Validate required fields
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' })
    }

    const post = await Post.create({
      title,
      body,
      author: req.user._id,
      imageUrl: imageUrl || null
    }).then(p => p.populate('author', 'name email'))
    
    return res.status(201).json(post)
  } catch (err) { next(err) }
}

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params
    const post = await Post.findById(id)
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    
    // Only allow post author to delete
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' })
    }
    
    await Post.findByIdAndDelete(id)
    return res.json({ message: 'Post deleted' })
  } catch (err) { next(err) }
}
