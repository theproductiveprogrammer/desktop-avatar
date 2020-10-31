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

/*    understand/
 * we hold information about the plugins here so they
 * can be accessed by the various functions
 */
let state = {
  dir: null,
  plugins: {},
}

/*    way/
 * download the latest plugin
 */
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
/*    understand/
 * Promisi-fied version of `getPluginRepo`
 */
function get(url) {
  return new Promise((resolve, reject) => {
    getPluginRepo(url, err => {
      if(err) reject(err)
      else resolve()
    })
  })
}

/*    way/
 * if the repo is downloaded update it otherwise clone
 * the repo
 */
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

/*    way/
 * run the plugin and return the info
 */
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
/*    way/
 * Promisi-fied version of `getInfo`
 */
function info(name) {
  return new Promise((resolve, reject) => {
    getInfo(name, (err, name) => {
      if(err) reject(err)
      else resolve(name)
    })
  })
}

/*    way/
 * ask the plugin for a chat message corresponding to
 * what the plugin is doing
 */
function getChat(task, status, cb) {
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
      let chat = context.plugin.info[chatname_1(status)]
      if(!chat) {
        chat = default_chat_1(task, status, context.plugin.name)
      } else if(typeof chat==="function") {
        chat = chat(task)
      } else {
        chat = "" + chat
      }
      if(!chat) cb(`Error getting chat for status: ${JSON.stringify(status)}`)
      else cb(null, chat)
    } catch(e) {
      cb(e)
    }
  })

  function chatname_1(status) {
    if(status == 102) return "sayOnStart"
    if(status == 200) return "sayOnEnd"
  }

  function default_chat_1(task, status, name) {
    if(!name) name = task.action
    const msgs = {
      102: [
        `Ok trying ${name}...`,
        `Doing ${name}...`,
        `I'm going to do ${name} now...`,
      ],
      200: [
        `${name} completed!`,
        `Done with ${name}...`,
      ],
      400: [
        `Error in task data for "${name}" (id: ${task.id})`,
        `Cannot perform task (id: ${task.id})`,
      ],
      504: [
        `Timeout trying ${name}!`,
        `Task ${name} took too long...timing out...`,
      ],
      500: [
        `Hit an unexpected error when trying to do "${name}"`,
        `Unexpected error caused ${name} task ${task.id} to fail...`,
      ],
      401: [
        `User intervention required! The site needs you to prove that you are a human (and I'm not!) ` + dh.anEmoji("face"),
      ],
      403: [
        `The site has refused to accept this user! Please see how you can get back on...`
      ],
    }
  }

}
/*    way/
 * Promisi-fied version of `getChat`
 */
function chat(task, status) {
  return new Promise((resolve, reject) => {
    getChat(task, status, (err, chat) => {
      if(err) reject(err)
      else resolve(chat)
    })
  })
}

/*    understand/
 * return the user's log
 */
function getLogger(task, cb) {
  let uctx = users.get(task.userId)
  if(!uctx) return cb("User for task not found")
  if(!uctx.logger) {
    let n = `User-${task.userId}`
    uctx.logger = lg(n, process.env.DEBUG)
  }
  cb(null, uctx.logger)
}

/*    way/
 * get the plugin, the user's browser, logger, and set
 * up the environment to call the plugin that will
 * perform the task.
 */
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
        let timeout = task.timeout || 30 * 1000
        let context = {
          trace: m => log.trace(`trace/${task.action}.${task.id}`, m),
          timeout,
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

        log("task/status", {
          id: task.id,
          msg: "task/started",
          code: 102,
        }, err => {
          cb(err)
          if(!err) {
            try {
              vm.createContext(context)
              plugin.code.runInContext(context)
            } catch(e) {
              console.error(e)
              status_servererr_1(e)
            }
          }
        })

        let status_set = false

        function status_done_1(msg) {
          if(status_set) return
          status_set = true
          if(!msg) msg = "task/done"
          log("task/status",{ id: task.id, msg, code: 200 })
        }
        function status_usererr_1(err) {
          status_with_1(400, err)
        }
        function status_timeout_1(err) {
          status_with_1(504, err)
        }
        function status_servererr_1(err) {
          status_with_1(500, err)
        }
        function status_capcha_1(err) {
          status_with_1(401, err)
        }
        function status_baduser_1(err) {
          status_with_1(403, err)
        }
        function status_with_1(code, err) {
          if(status_set) return
          status_set = true
          if(!err) err = "err/task"
          else if(err instanceof Error) err = err.stack
          log("task/status", { id: task.id, err, code })
        }

      })
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

/*    way/
 * load the plugin from disk or return it from cache
 */
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

/*    understand/
 * record the new tasks in the user logs
 */
function addTasks(tasks, cb) {
  add_ndx_1(0)

  function add_ndx_1(ndx) {
    if(ndx >= tasks.length) return cb()
    const task = tasks[ndx]
    getLogger(task, (err, log) => {
      if(err) return cb(err)
      log("task/new", task, err => {
        if(err) return cb(err)
        else add_ndx_1(ndx+1)
      })
    })
  }
}
/*    understand/
 * Promisi-fied version of `addTasks`
 */
function add(tasks) {
  return new Promise((resolve, reject) => {
    addTasks(tasks, (err, resp) => {
      if(err) reject(err)
      else resolve(resp)
    })
  })
}

module.exports = {
  get,
  info,
  chat,
  perform,
  add,
}
