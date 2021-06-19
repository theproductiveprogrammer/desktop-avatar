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

app.post('/dapp/v2/login', (req, res) => {
  const ui = users.login(req.body)
  if(!ui) res.status(400).end()
  else res.send(ui)
})

app.use('/', (req, res, next) => {
  console.log('UNHANDLED REQUEST:', `${req.originalUrl} ${req.method}`)
  console.log(req.body)
  next()
})

users.ondone(() => app.listen(port, () => console.log(`Listening at port ${port}...`)))
