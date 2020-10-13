'use strict'
const req = require('@tpp/req')

const dh = require('./display-helpers.js')
const vm = require('./avatar-vm.js')

function start(log, store) {
  vm.start(log, store, program)
}

const program = {

  main: [
    sayHi,
    { chat: "Let's get to work today :fire:", wait: 900 },
    dh.smiley(),
    getServerURL,
    "First let me check which users I am assigned to work for...",
    getUsers,
    //{ proc: dothework },
  ],

  /*
  dothework: [
    getTasks,
    pickUser,
    doWork,
    { proc: dothework },
  ],*/

  getserverurl: [
    openSettingsWindow,
    waitForServerURL,
    vm.RETURN,
  ],

  exit: [
    vars => `Bye for now ${dh.userName(vars.ui)}!`
  ],

  runptr: {
    n: null,
    ndx: 0
  },
}

function sayHi(vars, store) {
  vars.ui = store.get('ui')
  return `${dh.greeting()} ${dh.userName(vars.ui)}`
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

  req.post(p, {
    id: vars.ui.id,
    seed: vars.ui.seed,
    authKey: vars.ui.authKey
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


module.exports = {
  start,
}
