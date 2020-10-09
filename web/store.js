'use strict'
const dux = require('@tpp/dux')

function reducer(state, type, payload) {
  switch(type) {
    case "logview/show":
      return { ...state, logviewOpen: true }
    case "logview/hide":
      return { ...state, logviewOpen: false }
    case "logs/set":
      return { ...state, logs: payload }
    case "ui/set":
      return { ...state, ui: payload }
    default:
      console.error("WARNING(store.js):UNHANDLED STATE")
      return state
  }
}

module.exports = (logname, DEBUG, e) => {
  return dux.createStore(reducer, { logname, DEBUG, e })
}
