'use strict'

let USERS = {}

function set(uis) {
  let users = USERS
  USERS = {}
  if(uis) {
    uis.forEach(ui => {
      USERS[ui.id] = Object.assign({ ui }, users[ui.id])
    })
  }
}

function get(id) { return USERS[id] }

module.exports = {
  set,
  get,
}
