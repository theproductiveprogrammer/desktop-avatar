'use strict'
const dh = require('./display-helpers.js')

const flow = {
  vars: {},

  main: [
    sayHi,
  ],

  exit: [
    vars => `Bye ${dh.userName(vars.ui)}`
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
      if(typeof obj == "string") {
        obj = {
          bot: flow.vars.BOTID,
          line: obj,
        }
      }
      newMsg(obj, store, log)
      if(obj.script) flow.runptr = { n: obj.script, ndx: 0 }
      setTimeout(run_, 1000)
    }
  }
}

function newMsg(msg, store, log) {
  store.event("msg/add", {
    t: (new Date()).toISOString(),
    from: msg.bot,
    txt: msg.line,
  })
}

function sayHi(vars, store) {
  vars.ui = store.get('ui')
  return `${dh.greeting()} ${dh.userName(vars.ui)}`
}


module.exports = {
  start,
}
