'use strict'
const dux = require('@tpp/dux')

const store = dux.createStore(reducer, {})

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
    case "settings/set":
      return { ...state, settings: payload }
    default:
      console.error("WARNING(store.js):UNHANDLED STATE")
      return state
  }
}

module.exports = store
