'use strict'
const dux = require('@tpp/dux')

const store = dux.createStore(reducer, {})

function reducer(state, type, payload) {
  switch(type) {
    case "set/userinfo":
      return { ...state, userinfo: payload }
    default:
      console.error("WARNING(store.js):UNHANDLED STATE")
      return state
  }
}

module.exports = store
