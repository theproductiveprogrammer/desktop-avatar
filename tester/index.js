'use strict'
const express = require('express')
const app = express()

const port = 5555

const users = require('./users.js')

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/user/add', (req, res) => {
  users.add(req.body)
  res.end()
})

app.use('/', (req, res, next) => {
  console.log('UNHANDLED REQUEST:', `${req.originalUrl} ${req.method}`)
  console.log(req.body)
  next()
})

users.ondone(() => app.listen(port, () => console.log(`Listening at port ${port}...`)))
