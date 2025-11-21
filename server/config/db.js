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
    // Print connection details to help debug which MongoDB instance is used
    const conn = mongoose.connection
    const host = conn.host || (conn.client && conn.client.s && conn.client.s.url) || 'unknown'
    const port = conn.port || (conn.client && conn.client.s && conn.client.s.options && conn.client.s.options.port) || 'default'
    const name = conn.name || (uri.split('/').pop() || 'unknown')
    console.log('MongoDB connected')
    console.log(`  -> host: ${host}`)
    console.log(`  -> port: ${port}`)
    console.log(`  -> database: ${name}`)
  } catch (err) {
    // Log the error but do not exit the process so the server can still run
    // (useful for local dev where Mongo may not be running). API handlers
    // should handle missing DB gracefully.
    console.error('MongoDB connection error:', err.message)
  }
}

module.exports = connectDB
