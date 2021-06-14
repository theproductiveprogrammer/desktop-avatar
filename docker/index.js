'use strict'

const db = require('./db.js')
const kc = require('./kafclient.js')
const lg = require('./logger.js')
const plugins = require('./plugins.js')
const users = require('./users.js')
const loc = require('./loc.js')
const util = require('./util.js')
const dh = require('./display-helpers.js')

const store = require('./engine/store.js')

const chat = require('./chat.js')
const settings = require('./settings.js')


/*    understand/
 * main entry point into our program
 */
function main() {
  const log = lg(generateName(), process.env.DEBUG)
  chat.init(store)

  setupFolders(store, err => {
    if(err) return chat.say.foldersFailed(err)

    settings.load(store, err => {
      if(err) return chat.say.settingsFailed(err)

      login(store, err => {
        if(err) return chat.say.loginFailed(err)

        db.start(log, err => {
          if(err) return chat.say.dbFailed(err)

          log("app/info", `Logging to ${log.getName()}`)
        })

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

function setupFolders(store, cb) {
  store.event("msg/add", "setting up folders...")
  util.ensureExists(loc.cookies(), err => {
    if(err) cb(err)
    else util.ensureExists(loc.savedCookies(), cb)
  })
}

function login(cb) {
  const username = process.env.SALESBOX_USERNAME
  const password = process.env.SALESBOX_PASSWORD
  store.event("msg/add", `Logging in....${dh.anEmoji("password")}`)
  cb({ username, password})
}

main()
