'use strict'
const dux = require('@tpp/dux')

const store = dux.createStore(reducer, {
  logs: [],
  time: {},
  user: {},
  view: {},
  settings: {},
})

function reducer(state, type, payload) {
  let changes = 0
  state = {
    logs: r_1(logReducer, state.logs),
    time: r_1(timeReducer, state.time),
    user: r_1(userReducer, state.user),
    view: r_1(viewReducer, state.view),
    settings: r_1(settingsReducer, state.settings),
  }
  if(!changes) {
    console.error("WARNING(store.js):UNHANDLED STATE", type)
  }
  if(changes > 1) {
    console.error("WARNING(store.js):MULTI-HANDLE STATE", type)
  }
  return state

  function r_1(fn, val) {
    const r = fn(val, type, payload)
    if(r !== val) changes++
    return r
  }
}

function logReducer(state, type, payload) {
  switch(type) {
    case "logs/set": return payload;
    default: return state
  }
}
function timeReducer(state, type, payload) {
  switch(type) {
    case "timer/tick":
      return { ...state, now: payload }
    case "lastUserStatus/set":
      return { ...state, lastUserStatus: payload }
    case "lastServerTasks/set":
      return { ...state, lastServerTasks: payload }
    default: return state
  }
}
function userReducer(state, type, payload) {
  switch(type) {
    case "ui/set":
      return { ...state, ui: payload }
    case "msg/add":
      return { ...state, msgs: state.msgs.concat(payload) }
    case "msg/clear":
      return { ...state, msgs: [] }
    case "users/set":
      return { ...state, users: payload }
    case "user/tasks/set":
      {
        let userTasks = state.userTasks || {}
        userTasks = { ...userTasks }
        userTasks[payload.id] = payload
        return { ...state, userTasks }
      }
    case "user/task/assign":
      {
        let userTasks = state.userTasks || {}
        let ut = userTasks[payload.userId]
        userTasks = { ...userTasks }
        ut = { ...ut, assigned: payload }
        userTasks[payload.userId] = ut
        return { ...state, userTasks }
      }
    default: return state
  }
}
function viewReducer(state, type, payload) {
  switch(type) {
    case "logview/show":
      return { ...state, logviewOpen: true }
    case "logview/hide":
      return { ...state, logviewOpen: false }
    default: return state
  }
}
function settingsReducer(state, type, payload) {
  switch(type) {
    case "settings/set": return payload
    default: return state
  }
}

module.exports = store
