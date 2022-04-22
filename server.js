const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()
const app = require('./app')

const PORT = 8000

mongoose.connect(process.env.DATABASE, {}).then(() => {
  console.log('db connection established')
})

app.listen(PORT, () => {
  console.log(`server running on port: ${PORT}...`)
})
