'use strict'
const req = require('@tpp/req')

const dh = require('./display-helpers.js')

const flow = {
  vars: {},

  main: [
    sayHi,
    { line: "Let's get to work today :fire:", delay: 900 },
    dh.smiley(),
    "First let me check which users I am assigned to work for...",
    getUsers,
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

function run(script, log, store) {
  flow.runptr = { n: script, ndx: 0 }
  log.trace("avatar/run/started", flow.runptr)

  run_()

  function run_() {
    let script = flow[flow.runptr.n]
    if(!script) {
      log("err/avatar/run/noscript", flow.runptr)
      return
    }
    let line = script[flow.runptr.ndx]
    if(!line) {
      log.trace("avatar/run/ended", flow.runptr)
      return
    }
    flow.runptr.ndx++

    if(typeof line !== "function") run_line_1(line)
    else {
      let l = line(flow.vars, store, log, run_line_1)
      if(l) run_line_1(l)
    }

    function run_line_1(obj) {
      if(typeof obj == "string") obj = { line: obj }
      newMsg(obj, store, log)
      if(obj.script) flow.runptr = { n: obj.script, ndx: 0 }
      let delay = Math.random() * 4000 + 1000
      if(obj.delay) delay = obj.delay
      setTimeout(run_, delay)
    }
  }
}

function newMsg(msg, store, log) {
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
      cb("exit")
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
