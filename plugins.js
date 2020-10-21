'use strict'
const path = require('path')
const fs = require('fs')
const vm = require('vm')

const { clone, pull } = require('isomorphic-git')
const http = require('isomorphic-git/http/node')

const loc = require('./loc.js')
const dh = require('./web/display-helpers.js')
const users = require('./users.js')
const lg = require('./logger.js')

let state = {
  dir: null,
  plugins: {},
}

function getPluginRepo(url, cb) {
  state = { dir: null, plugins: {} }
  getLatest(url, loc.plugin(), (err, dir) => {
    if(err) cb(err)
    else {
      state.dir = dir
      cb()
    }
  })
}
function get(url) {
  return new Promise((resolve, reject) => {
    getPluginRepo(url, err => {
      if(err) reject(err)
      else resolve()
    })
  })
}

function getLatest(from, to, cb) {
  let url
  try {
    url = new URL(from)
  } catch(e) {
    return cb(e)
  }
  let name = path.basename(url.pathname, ".git")
  to = path.join(to, name)
  fs.lstat(to, (err, stats) => {
    if(err && err.code === "ENOENT") cloneRepo(from, to, cb)
    else if(err) cb(err)
    else updateRepo(from, to, cb)
  })
}

function cloneRepo(from, to, cb) {
  clone({
    fs,
    http,
    dir: to,
    url: from,
  }).then(() => cb(null, to))
  .catch(cb)
}

function updateRepo(from, to, cb) {
  pull({
    fs,
    http,
    dir: to,
    fastForwardOnly: true,
    author: { name: "invalid", email: "in@valid.com" },
  }).then(() => cb(null, to))
  .catch(cb)
}

function getInfo(name, cb) {
  getPlugin(name, (err, plugin) => {
    if(err) return cb(err)
    let context = {
      console,
      plugin: {name, info:{}},
    }
    try {
      vm.createContext(context)
      plugin.code.runInContext(context)
      return cb(null, context.plugin.info.name)
    } catch(e) {
      cb(e)
    }
  })
}
function info(name) {
  return new Promise((resolve, reject) => {
    getInfo(name, (err, name) => {
      if(err) reject(err)
      else resolve(name)
    })
  })
}

function getChat(task, cb) {
  if(!task.action) return cb_("Task missing 'action' key")
  getPlugin(task.action, (err, plugin) => {
    if(err) return cb(err)
    let context = {
      console,
      plugin: {name: task.action, info:{}},
    }
    try {
      vm.createContext(context)
      plugin.code.runInContext(context)
      let chat = chat_1(task.action)
      if(typeof context.plugin.info.chat==="function") {
        chat = context.plugin.info.chat(task)
      } else if(typeof context.plugin.info.chat==="string"){
        chat = context.plugin.info.chat
      }
      return cb(null, chat)
    } catch(e) {
      cb(e)
    }
  })

  function chat_1(name) {
    dh.oneOf(
      `Ok trying ${name}...`,
      `Doing ${name}...`,
      `I'm going to do ${name} now...`,
    )
  }
}
function chat(task) {
  return new Promise((resolve, reject) => {
    getChat(task, (err, chat) => {
      if(err) reject(err)
      else resolve(chat)
    })
  })
}

function getLogger(task, cb) {
  let uctx = users.get(task.userId)
  if(!uctx) return cb("User for task not found")
  if(!uctx.logger) {
    let n = `User-${task.userId}`
    uctx.logger = lg(n, process.env.DEBUG)
  }
  cb(null, uctx.logger)
}

function performTask(task, cb) {
  getPlugin(task.action, (err, plugin) => {
    if(err) return cb(err)
    let uctx = users.get(task.userId)
    if(!uctx) {
      log("err/task/user/notfound", task.userId)
      return cb("invalid task: user not found")
    }
    users.browser(uctx)
    .then(browser => {
      getLogger(task, (err, log) => {
        if(err) return cb(err)
        let context = {
          log,
          status: {
            done: status_done_1,
            usererr: status_usererr_1,
            timeout: status_timeout_1,
            servererr: status_servererr_1,
            errcapcha: status_capcha_1,
            baduser: status_baduser_1,
          },
          browser,
          console,
          plugin: {name: task.action, info:{}, task},
        }
        try {
          log("task/new", task, err => {
            if(err) cb(err)
            else {
              vm.createContext(context)
              plugin.code.runInContext(context)
            }
          })
        } catch(e) {
          cb(e)
        }
      })
    })
    .catch(cb)
  })

  function status_done_1(msg) {
    let data
    if(msg) data = { id: task.id, msg }
    else data = { id: task.id }
    log("task/done", data, cb)
  }
  function status_usererr_1(err) { status_with_1(400, err) }
  function status_timeout_1(err) { status_with_1(504, err) }
  function status_servererr_1(err) { status_with_1(500, err) }
  function status_capcha_1(err) { status_with_1(401, err) }
  function status_baduser_1(err) { status_with_1(403, err) }
  function status_with_1(status, err) {
    if(err instanceof Error) err = err.stack
    let data
    if(err) data = { id: task.id, status, err }
    else data = { id: task.id, status }
    log("err/task/failed", data, cb)
  }
}
function perform(task) {
  return new Promise((resolve, reject) => {
    performTask(task, (err, resp) => {
      if(err) reject(err)
      else resolve(resp)
    })
  })
}

function getPlugin(name, cb) {
  if(!state.dir) return cb("plugins.js: not initialized")
  let plugin = state.plugins[name]
  if(plugin && plugin.code) return cb(null, plugin)

  plugin = {
    p: path.join(state.dir, name + ".js")
  }

  fs.readFile(plugin.p, (err, code) => {
    if(err) cb(err)
    else {
      try {
        plugin.code = new vm.Script(code)
        state.plugins[name] = plugin
        cb(null, plugin)
      } catch(e) {
        cb(e)
      }
    }
  })
}

module.exports = {
  get,
  info,
  chat,
  perform,
}
