'use strict'
const dux = require('@tpp/dux')

function reducer(state, type, payload) {
  switch(type) {
    case "logview/show":
      return { ...state, logviewOpen: true }
    default:
      console.error("WARNING(store.js):UNHANDLED STATE")
      return state
  }
}

module.exports = (logname, e) => {
  return dux.createStore(reducer, { logname, e })
}
