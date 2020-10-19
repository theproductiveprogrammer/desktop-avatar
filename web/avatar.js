'use strict'
const req = require('@tpp/req')

const dh = require('./display-helpers.js')
const vm = require('./avatar-vm.js')

const kc = require('../kafclient.js')

function start(log, store) {
  vm.start(log, store, program)
}

const program = {
  main: [
    getServerURL,
    getUsers,
    "Getting Plugins",
    getPlugins,
    getTasks,
    showStatus,
    doWork,
    showStatus,
  ],

  main1: [
    sayHi,
    { chat: "Let's get to work today :fire:", wait: 900 },
    dh.smiley(),
    getServerURL,
    "First let me check which users I am assigned to work for...",
    getUsers,
    { proc: "dothework" },
  ],

  dothework: [
    workWorkWork,
    getTasks,
    pickUser,
    doWork,
    { proc: "dothework" },
  ],

  getserverurl: [
    openSettingsWindow,
    waitForServerURL,
    vm.RETURN,
  ],

  exit: [
    vars => `Bye for now`
  ],

  runptr: {
    n: null,
    ndx: 0
  },
}

function sayHi({vars, store}) {
  return `${dh.greeting()} ${dh.userName(store.get("ui"))}`
}

function getServerURL({vars}) {
  let serverURL = store.get("settings.serverURL")
  if(!serverURL) return {
    chat: "I need the server URL to be set so I can connect to the server.\n\nI get all sorts of information from it. Please set the serverURL for me to proceed",
    proc: "getserverurl",
  }
  if(serverURL.endsWith("/")) {
    serverURL = serverURL.substring(0, serverURL.length)
  }
  vars.serverURL = serverURL
  return { wait: 0 }
}

function openSettingsWindow() {
  window.show.settings()
  return {}
}

function waitForServerURL(env, cb) {
  let serverURL = env.store.get("settings.serverURL")
  if(serverURL) {
    if(serverURL.endsWith("/")) {
      serverURL = serverURL.substring(0, serverURL.length-2)
    }
    env.vars.serverURL = serverURL
    cb()
  } else {
    setTimeout(() => {
      waitForServerURL(env, cb)
    }, 1000)
  }
}

function getUsers({vars, store, log}, cb) {
  log("avatar/gettingusers")
  let p = `${vars.serverURL}/dapp/v2/myusers`
  let ui = store.get("ui")

  req.post(p, {
    id: ui.id,
    seed: ui.seed,
    authKey: ui.authKey
  }, (err, resp) => {
    if(err) {
      log("err/avatar/gettingusers", err)
      cb({
        chat: "**Error getting users**!\n\nI will notify the developers of this issue. In the meantime you can check the message logs and see if that gives you any ideas.",
        proc: "exit"
      })
    } else {
      let users = resp.body
      log("avatar/gotusers", { num: users.length })
      log.trace("avatar/gotusers", users)
      store.event("users/set", users)
      cb({
        from: -1,
        chat: `You have ${users.length} user(s) to manage`
      })
    }
  })
}

const DEFAULT_PLUGIN_URL="https://github.com/theproductiveprogrammer/desktop-avatar-plugins.git"

function getPlugins({store, log}, cb) {
  log("avatar/gettingplugins")
  let pluginURL = store.get("settings.pluginURL")
  if(!pluginURL) pluginURL = DEFAULT_PLUGIN_URL
  window.get.plugins(pluginURL)
    .then(() => cb({}))
    .catch(err => {
      log("err/avatar/gettingplugins", err)
      cb({
        chat: "**Error downloading plugins**!\n\nI will notify the developers of this issue. In the meantime you can check the message logs and see if that gives you any ideas.",
        proc: "exit"
      })
    })
}

function getTasks({vars, store, log}, cb) {
  log("avatar/gettingtasks")
  let p = `${vars.serverURL}/dapp/v2/tasks`
  let ui = store.get("ui")
  let users = store.get("users")
  if(users) users = users.concat(ui)
  else users = [ ui ]
  let forUsers = users.map(ui => ui.id)

  req.post(p, {
    id: ui.id,
    seed: ui.seed,
    authKey: ui.authKey,
    forUsers,
  }, (err, resp) => {
    if(err) {
      log("err/avatar/gettingtasks", err)
      cb({
        chat: "**Error getting tasks**!\n\nI will notify the developers of this issue. In the meantime you can check the message logs and see if that gives you any ideas.",
        proc: "exit"
      })
    } else {
      let tasks = resp.body
      log("avatar/gottasks", { num: tasks.length })
      log.trace("avatar/gottasks", tasks)
      store.event("tasks/set", tasks)
      cb({
        from: -1,
        chat: `Giving you ${tasks.length} task(s) to do`
      })
    }
  })
}

function pickUser() {
  return {}
}

let froms = {}
function showStatus({store, say}, cb) {
  let ui = store.get("ui")
  let users = store.get("users")
  if(users) users = users.concat(ui)
  else users = [ ui ]

  get_ndx_1(0)

  function get_ndx_1(ndx) {
    if(ndx >= users.length) return cb({})
    let ui = users[ndx]
    let from = froms[ui.id] || 1
    let n = `User-${ui.id}`
    kc.getFrom(n, from, (err, last, recs) => {
      if(err) log("err/showstatus/get", err)
      else {
        if(last >= from) froms[ui.id] = last + 1
        recs.forEach(msg => say({
          from: ui,
          chat: JSON.stringify(msg),
        }))
        get_ndx_1(ndx+1)
      }
    })
  }
}

function doWork({store, say}, cb) {
  let tasks = store.get("tasks")
  if(!tasks || !tasks.length) return `Nothing to do...${dh.anEmoji("sleepy")}`
  let task = tasks[0]
  window.get.taskchat(task)
    .then(chat => {
      say(chat)
      window.do.task(task)
        .then(resp => {
          cb("Done " + JSON.stringify(resp))
        })
        .catch(err => {
          // TODO
          //
          cb("Got Error")
          console.error(err)
        })
    })
    .catch(err => {
      // TODO
      cb("Got Error")
      console.error(err)
    })
}

function workWorkWork() {
  return dh.oneOf([
    `Work! Work! Work! ${dh.smiley()}...`,
    "Let's get some work from the server...",
    "Checking the server for work to do...",
    "Let me go check the server for some work...",
  ])
}

module.exports = {
  start,
}
