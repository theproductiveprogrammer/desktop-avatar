'use strict'
const dh = require('./display-helpers.js')

function start(store, logger) {
  let userinfo
  store.react("userinfo", ui => {
    if(ui) {
      userinfo = ui
      loggedIn(userinfo, store, logger)
    } else {
      if(userinfo) loggedOut(userinfo, store, logger)
    }
  })
}

function loggedIn(ui, store, logger) {
  logger.botMsg(`${dh.greeting()} ${dh.userName(ui)}`)

}

function loggedOut(ui, store, logger) {
  logger.botMsg(`${dh.userName(ui)} logged Out`)
}

module.exports = {
  start,
}
