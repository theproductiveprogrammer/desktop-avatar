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
  logger.botMsg(`${greeting_1()} ${dh.userName(ui)}`)

  function greeting_1() {
    let hh = (new Date()).getHours()
    if(hh >= 6 && hh < 12) return "Good Morning"
    if(hh >= 12 && hh < 16) return "Good Afternoon"
    return "Good Evening"
  }
}

function loggedOut(ui, store, logger) {
  logger.svrMsg("Server says bye")
  logger.botMsg(`${dh.userName(ui)} Logged Out`)
}

module.exports = {
  start,
}
