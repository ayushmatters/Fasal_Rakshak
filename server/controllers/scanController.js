const fs = require('fs')
const path = require('path')
const Scan = require('../models/Scan')

// Upload handler: create scan doc with processing status
exports.upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const filePath = `/uploads/${req.file.filename}`
    const scan = await Scan.create({ user: req.user ? req.user._id : null, imageUrl: filePath, status: 'processing' })
    return res.json({ id: scan._id, scan })
  } catch (err) { next(err) }
}

// Process endpoint: demo processing that updates result after delay
exports.process = async (req, res, next) => {
  try {
    const { id } = req.params
    const scan = await Scan.findById(id)
    if (!scan) return res.status(404).json({ message: 'Scan not found' })

    // Determine file path: uploaded file or demo path
    const serverRoot = path.join(__dirname, '..')
    let localFile = path.join(serverRoot, scan.imageUrl || '')
    // Fallback demo file (provided in task)
    const demoFile = '/mnt/data/Recording 2025-11-19 203905.mp4'
    if (!fs.existsSync(localFile)) {
      // fallback to demo file if available
      if (fs.existsSync(demoFile)) localFile = demoFile
    }

    // Simulate processing time
    setTimeout(async () => {
      // Simple placeholder result — in real app replace with ML inference
      const result = { disease: 'Leaf Blight', confidence: 0.87 }
      scan.result = result
      scan.status = 'complete'
      await scan.save()
    }, 1200)

    return res.json({ message: 'Processing started', id: scan._id })
  } catch (err) { next(err) }
}

exports.getScan = async (req, res, next) => {
  try {
    const { id } = req.params
    const scan = await Scan.findById(id)
    if (!scan) return res.status(404).json({ message: 'Not found' })
    return res.json(scan)
  } catch (err) { next(err) }
}
