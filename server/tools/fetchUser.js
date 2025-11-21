const mongoose = require('mongoose')
const path = require('path')

const email = process.argv[2] || process.env.TEST_EMAIL
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/fasal_rakshak'

if (!email) {
  console.error('Usage: node tools/fetchUser.js <email>')
  process.exit(2)
}

const run = async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    // require model from server/models
    const User = require(path.join(__dirname, '..', 'models', 'User'))
    const user = await User.findOne({ email }).lean()
    if (!user) {
      console.log(`User not found for email: ${email}`)
    } else {
      // redact password in output
      if (user.password) user.password = '[REDACTED]'
      console.log(JSON.stringify(user, null, 2))
    }
    await mongoose.disconnect()
  } catch (err) {
    console.error('Error querying DB:', err && err.message ? err.message : err)
    process.exit(1)
  }
}

run()
