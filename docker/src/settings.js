'use strict'
const fs = require('fs')
const path = require('path')

const loc = require('./loc.js')

/*    way/
 * load the settings, ensuring that puppetShow is false
 */
function load(store, cb) {
  const f = path.join(loc.home(), "settings.json")
  store.event("msg/add", `Loading settings.json...`)
  fs.readFile(f, (err, data) => {
    if(err) return cb(err)
    try {
      const settings = JSON.parse(data)
      if(settings.puppetShow) settings.puppetShow = false
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
