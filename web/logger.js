'use strict'
const { ipcRenderer } = window.require('electron')

const db = require('./db.js')

/*    understand/
 * We need a to get the shared logfile name
 */
let LOG
ipcRenderer.invoke("get-logname").then(name => {
  LOG = name
})

function name() { return LOG }

function msg(o) { db.put(o, LOG) }

function log(msg) {
  if(typeof msg == "string") msg = { msg }
  msg.t = (new Date()).toISOString()
  db.put(msg, LOG)
}

function err(msg, e) {
  if(typeof msg == "string") {
    if(!e) msg = { err: msg}
    else msg = { msg }
  }
  if(e) {
    if(e.stack) msg.err == e.stack
    else if(e.response) msg.err = JSON.stringify(e.response)
    else msg.err = JSON.stringify(e)
  }
  msg.t = (new Date()).toISOString()
  db.put(msg, LOG)
}

function get(cb) {
  db.get(LOG, cb, (err, end) => {
    if(err) console.log(err)
    if(end) return 5 * 1000
    return 500
  })
}

module.exports = {
  name,
  log,
  err,
  msg,
  get,
}
