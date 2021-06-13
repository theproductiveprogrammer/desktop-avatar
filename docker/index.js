'use strict'

const db = require('./db.js')
const kc = require('./kafclient.js')
const lg = require('./logger.js')
const plugins = require('./plugins.js')
const users = require('./users.js')
const loc = require('./loc.js')
const util = require('./util.js')
const dh = require('./display-helpers.js')
const fs = require('fs')


/*    understand/
 * main entry point into our program
 */
function main() {
  const log = lg(generateName(), process.env.DEBUG)

  setupFolders(err => {
    if(err) return console.error(err)

    login(err => {
      if(err) {
        console.error(err)
        loginFailedMsg()
        return
      }

      db.start(log, err => {
        if(err) console.error(err)
        else log("app/info", `Logging to ${log.getName()}`)
      })

    })

  })

}

/*    understand/
 * We need a logfile to hold the messages of our current
 * run without interfering with other concurrent runs
 */
function generateName() {
  let n = `log-${(new Date()).toISOString()}-${process.pid}`
  return n.replace(/[/:\\*&^%$#@!()]/g, "_")
}

function setupFolders(cb) {
  util.ensureExists(loc.cookies(), err => {
    if(err) cb(err)
    else util.ensureExists(loc.savedCookies(), cb)
  })
}

function login(cb) {
  cb(1)
}

/*    way/
 * tell the user (nicely) that login failed and what he should do next
 */
function loginFailedMsg() {
  console.log(dh.emojifyConsole(`Login failed! ${dh.anEmoji("sad")}`))
}

main()
