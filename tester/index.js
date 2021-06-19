'use strict'
const express = require('express')
const app = express()
const babydb = require('baby-db')

const port = 5555

const users = require('./users.js')
const tasks = require('./tasks.js')

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

app.post('/dapp/v2/myusers', (req, res) => res.send("[]"))

app.post('/tasks/add', (req, res) => {
  tasks.add(req.body)
  res.end()
})

app.post('/dapp/v2/tasks', (req, res) => {
  const users = req.body.forUsers
  if(!users) res.status(400).end()
  else res.send(tasks.getFor(users.map(u => u.id)))
})

app.use('/', (req, res, next) => {
  console.log('UNHANDLED REQUEST:', `${req.originalUrl} ${req.method}`)
  console.log(req.body)
  next()
})

babydb.onExitSignal(() => process.exit())

users.ondone(ondbLoaded)
tasks.ondone(ondbLoaded)

let num_db_loaded = 0
function ondbLoaded() {
  num_db_loaded++
  if(num_db_loaded === babydb.numdb()) app.listen(port, () => console.log(`Listening at port ${port}...`))
}
