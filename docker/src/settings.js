'use strict'
const path = require('path')

const loc = require('./loc.js')

const chat = require('./chat.js')

function load(store, cb) {
  const f = path.join(loc.db(), "settings.json")
  chat(`Loading from ${f}`)
}

module.exports = {
  load,
}
