'use strict'

function start(store, logger) {
  let firstLogin
  store.react("userinfo", ui => {
    if(ui) {
      firstLogin = true
      loggedIn(store, logger)
    } else {
      if(firstLogin) loggedOut(store, logger)
    }
  })
}

function loggedIn(store, logger) {
  let ui = store.get("userinfo")
  logger.botMsg(`${greeting_1()} ${name_1(ui)}`)
  logger.svrMsg("Server says hello")

  function greeting_1() {
    let hh = (new Date()).getHours()
    if(hh >= 6 && hh < 12) return "Good Morning"
    if(hh >= 12 && hh < 4) return "Good Afternoon"
    return "Good Evening"
  }

  function name_1(ui) {
    if(!ui) return "(no user)"
    if(ui.firstName && ui.lastName) {
      return ui.firstName + " " + ui.lastName
    }
    if(ui.firstName) return ui.firstName
    if(ui.lastName) return ui.lastName
    return "(no name)"
  }
}

function loggedOut(store, logger) {
  logger.svrMsg("Server says bye")
  logger.botMsg("Logged Out")
}

module.exports = {
  start,
}
