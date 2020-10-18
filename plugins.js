'use strict'
const path = require('path')
const fs = require('fs')
const vm = require('vm')

const { clone, pull } = require('isomorphic-git')
const http = require('isomorphic-git/http/node')

const loc = require('./loc.js')
const dh = require('./web/display-helpers.js')
const users = require('./users.js')

const puppeteer = require('puppeteer')

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

function getBrowser(task) {
  let uctx = users.get(task.userId)
  if(!uctx) return Promise.reject("User for task not found")
  if(uctx.browser) return Promise.resolve(uctx.browser)
  let args = []
  if(uctx.proxy) {
    args.push(`--proxy-server=socks5://localhost:${uctx.proxy}`)
  }
  return new Promise((resolve, reject) => {
    puppeteer.launch({ headless:false, args })
      .then(browser => {
        uctx.browser = browser
        resolve(browser)
      })
      .catch(reject)
  })
}

function performTask(task, cb) {
  getPlugin(task.action, (err, plugin) => {
    if(err) return cb(err)
    getBrowser(task)
    .then(browser => {
      let context = {
        cb,
        browser,
        console,
        plugin: {name: task.action, info:{}, task},
      }
      try {
        vm.createContext(context)
        plugin.code.runInContext(context)
      } catch(e) {
        cb(e)
      }
    })
    .catch(cb)
  })
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
