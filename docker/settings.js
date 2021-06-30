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
  const settings = envSet(defaultSettings())
  fs.readFile(f, (err, data) => {
    if(err && err.code == 'ENOENT') {
        store.event("settings/set", settings)
        return cb()
    }
    if(err) return cb(err)
    try {
      Object.assign(settings, JSON.parse(data))
      if(settings.puppetShow) settings.puppetShow = false
      store.event("settings/set", settings)
      cb()
    } catch(err) {
      cb(err)
    }
  })
}

function envSet(settings) {
  if(!settings) settings = {}
  if(process.env.SERVER_URL) {
    settings.serverURL = process.env.SERVER_URL
  }
  if(process.env.TIMEOUT) {
    const v = parseInt(process.env.TIMEOUT)
    if(!isNaN(v)) settings.timeout = v
  }
  if(process.env.MAXBROWERS) {
    const v = parseInt(process.env.MAXBROWERS)
    if(!isNaN(v)) settings.maxbrowsers = v
  }
  if(process.env.USERIPS) {
    const v = process.env.USERIPS.split(",").map(v => v.trim())
    settings.userips = v
  }
  if(process.env.USERLIST) {
    settings.userList = process.env.USERLIST
  }
  return settings
}

function defaultSettings() {
  return {
    serverURL: "https://app3.salesbox.ai",
    timeout: 100000,
    maxbrowsers: 2,
    userips: [],
    userList: ""
  }
}

module.exports = {
  load,
}
