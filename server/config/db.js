const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/fasal_rakshak'
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('MongoDB connected')
  } catch (err) {
    // Log the error but do not exit the process so the server can still run
    // (useful for local dev where Mongo may not be running). API handlers
    // should handle missing DB gracefully.
    console.error('MongoDB connection error:', err.message)
  }
}

module.exports = connectDB
