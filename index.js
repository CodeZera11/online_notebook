const connectToMongo = require('./db');
const express = require('express');
const router_auth = require('./routes/auth')
const router_notes = require('./routes/notes')
var cors = require('cors')
require('dotenv').config()

var app = express()
app.use(cors())

const port = process.env.PORT || 10000

app.use(express.json());

app.use('/api/auth', router_auth)
app.use('/api/notes', router_notes)

app.listen(port, async() => {
  await connectToMongo()
  console.log(`iNotebook backend listening on port ${process.env.BASE_URL}`)
})