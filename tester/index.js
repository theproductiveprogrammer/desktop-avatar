'use strict'
const express = require('express')
const app = express()

const port = 5555

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use('/', (req, res, next) => {
  console.log('UNHANDLED REQUEST:', `${req.originalUrl} ${req.method}`)
  console.log(req.body)
  next()
})

app.listen(port, () => console.log(`Listening at port ${port}...`))
