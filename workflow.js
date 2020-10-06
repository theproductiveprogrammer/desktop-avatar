'use strict'

function start(state, logger) {
  ui_poll_1(state, logger)

  function ui_poll_1(state, logger) {
    if(!state.userinfo) {
      setTimeout(() => ui_poll_1(state, logger), 3 * 1000)
    } else {
      startWorkflow(state, logger)
    }
  }
}

function startWorkflow(state, logger) {
  logger.botMsg(`${greeting_1()} ${name_1(state.userinfo)}`)
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

module.exports = {
  start,
}
