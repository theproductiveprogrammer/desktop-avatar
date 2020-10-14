'use strict'
const req = require('@tpp/req')

const dh = require('./display-helpers.js')
const vm = require('./avatar-vm.js')

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
    doWork,
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

function sayHi(vars, store) {
  return `${dh.greeting()} ${dh.userName(store.get("ui"))}`
}

function getServerURL(vars) {
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

function waitForServerURL(vars, store, log, cb) {
  let serverURL = store.get("settings.serverURL")
  if(serverURL) {
    if(serverURL.endsWith("/")) {
      serverURL = serverURL.substring(0, serverURL.length-2)
    }
    vars.serverURL = serverURL
    cb()
  } else {
    setTimeout(() => {
      waitForServerURL(vars, store, log, cb)
    }, 1000)
  }
}

function getUsers(vars, store, log, cb) {
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

function getPlugins(vars, store, log, cb) {
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

function getTasks(vars, store, log, cb) {
  log("avatar/gettingtasks")
  let p = `${vars.serverURL}/dapp/v2/tasks`
  let ui = store.get("ui")

  req.post(p, {
    id: ui.id,
    seed: ui.seed,
    authKey: ui.authKey,
    forUsers: [ ui.id ],
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

function doWork(vars, store, log, cb) {
  let tasks = store.get("tasks")
  if(!tasks || !tasks.length) return `Nothing to do...${dh.anEmoji("sleepy")}`
  window.get.taskdesc(tasks[0])
    .then(desc => cb(desc))
    .catch(cb)
  /*
  let task = tasks[0]
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
    */
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
