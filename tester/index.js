'use strict'
const express = require('express')
const app = express()

const port = 5555

app.use((req, res, next) => {
  console.log(`${req.originalUrl} ${req.method}`)
  next()
})

app.listen(port, () => console.log(`Listening at port ${port}...`))
