'use strict'
const dux = require('@tpp/dux')

const store = dux.createStore(reducer, { msgs: [] })

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
    case "msg/add":
      return { ...state, msgs: state.msgs.concat(payload) }
    case "timer/tick":
      return { ...state, now: payload }
    case "users/set":
      return { ...state, users: payload }
    case "tasks/set":
      return { ...state, tasks: payload }
    default:
      console.error("WARNING(store.js):UNHANDLED STATE", type)
      return state
  }
}

module.exports = store
