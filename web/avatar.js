'use strict'
const req = require('@tpp/req')

const dh = require('./display-helpers.js')

const flow = {
  vars: {},
  stack: [],

  main: [
    sayHi,
    { line: "Let's get to work today :fire:", delay: 900 },
    dh.smiley(),
    getServerURL,
    "First let me check which users I am assigned to work for...",
    getUsers,
  ],

  getserverurl: [
    openSettingsWindow,
    waitForServerURL,
    RETURN,
  ],

  exit: [
    vars => `Bye for now ${dh.userName(vars.ui)}!`
  ],

  runptr: {
    n: null,
    ndx: 0
  },
}

function start(log, store) {
  let curr
  store.react('ui', ui => {
    if(curr && !ui) run("exit", log, store)
    curr = ui
    if(!ui) return
    if(ui.bots) {
      for(let i = 0;i < ui.bots.length;i++) {
        if(ui.bots[i].logo) flow.vars.BOTID = ui.bots[i].id
      }
    }
    run("main", log, store)
  })
}

function RETURN(vars, store, log, cb) {
  log.trace("avatar/run/return", flow.runptr)
  flow.runptr = flow.stack.pop()
  return { delay: 0 }
}

function run(script, log, store) {
  if(flow.runptr.n) {
    flow.stack.push({
      n: flow.runptr.n,
      ndx: flow.runptr.ndx,
    })
  }
  flow.runptr = { n: script, ndx: 0 }
  log.trace("avatar/run/begin", flow.runptr)

  run_()

  function run_() {
    log.trace("avatar/running", flow.runptr)
    let script = flow[flow.runptr.n]
    if(!script) {
      log("err/avatar/run/noscript", flow.stack)
      return
    }
    let line = script[flow.runptr.ndx]
    if(!line) {
      log.trace("avatar/run/fin", flow.runptr)
      return
    }
    flow.runptr.ndx++

    if(typeof line !== "function") run_line_1(line)
    else {
      let l = line(flow.vars, store, log, run_line_1)
      if(l) run_line_1(l)
    }

    function run_line_1(obj) {
      if(!obj) return run_()
      if(typeof obj == "string") obj = { line: obj }
      newMsg(obj, store, log)
      let delay = Math.random() * 4000 + 1000
      if(obj.delay) delay = obj.delay
      if(obj.script) setTimeout(() => {
        run(obj.script, log, store)
      }, delay)
      else setTimeout(run_, delay)
    }
  }
}

function newMsg(msg, store, log) {
  if(!msg.line) return
  store.event("msg/add", {
    t: (new Date()).toISOString(),
    from: msg.bot || flow.vars.BOTID,
    txt: msg.line,
  })
}

function sayHi(vars, store) {
  vars.ui = store.get('ui')
  return `${dh.greeting()} ${dh.userName(vars.ui)}`
}

function getServerURL() {
  let serverURL = store.get("settings.serverURL")
  if(serverURL) return {}
  else return {
    line: "I need the server URL to be set so I can connect to the server.\n\nI get all sorts of information from it. Please set the serverURL for me to proceed",
    script: "getserverurl",
  }
}

function openSettingsWindow(vars, store, log, cb) {
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
    setTimeout(() => waitForServerURL(vars, store, log, cb), 1000)
  }
}

function getUsers(vars, store, log, cb) {
  log("avatar/gettingusers")
  let serverURL = store.get("settings.serverURL")
  let p = serverURL
  if(!p.endsWith("/")) p += "/"
  p += "dapp/v2/myusers"

  req.post(p, {
    id: vars.ui.id,
    seed: vars.ui.seed,
    authKey: vars.ui.authKey
  }, (err, resp) => {
    if(err) {
      log("err/avatar/gettingusers", err)
      cb({
        line: "**Error getting users**!\n\nI will notify the developers of this issue. In the meantime you can check the message logs and see if that gives you any ideas.",
        script: "exit"
      })
    } else {
      let users = resp.body
      log("avatar/gotusers", { num: users.length })
      log.trace("avatar/gotusers", users)
      store.event("users/set", users)
      cb({
        bot: -1,
        line: `You have ${users.length} user(s) to manage`
      })
    }
  })
}


module.exports = {
  start,
}
