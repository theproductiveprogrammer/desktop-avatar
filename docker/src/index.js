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
const login = require('./login.js')

const avatar = require('./engine/avatar/')

/*    understand/
 * main entry point into our program
 */
function main() {
  const log = lg(generateName(), process.env.DEBUG)
  chat.init(store)

  setupFolders(store, err => {
    if(err) return chat.say.foldersFailed(err)

    db.start(log, err => {
      if(err) return chat.say.dbFailed(err)

      log("app/info", `Logging to ${log.getName()}`)

      settings.load(store, err => {
        if(err) {
          chat.say.settingsFailed(err, () => process.exit(1))
        } else {
          setUsers(store)
          avatar.start(log, store)
          login(log, store, err => {
            if(err) chat.say.loginFailed(err, () => process.exit(1))
          })
        }

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

function setUsers(store) {
  store.react('user.ui', set_users_1)
  store.react("user.users", set_users_1)

  function set_users_1() {
    let ui = store.get('user.ui')
    if(!ui) users.set(null)
    else {
      let users_ = store.get('user.users')
      if(!users_) users_ = [ ui ]
      else users_ = users_.concat(ui)
      users.set(users_)
    }
  }

}

main()
