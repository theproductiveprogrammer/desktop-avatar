'use strict'
const path = require('path')

const loc = require('./loc.js')

function load(store, cb) {
  return cb(1)
  const f = path.join(loc.home(), "settings.json")
  store.event("msg/add", `Loading settings.json...`)
  fs.readFile(f, (data, err) => {
    if(err) return cb(err)
    try {
      const settings = JSON.parse(data)
      store.event("settings/set", settings)
      cb()
    } catch(err) {
      cb(err)
    }
  })
}

module.exports = {
  load,
}
