'use strict'
const req = require('@tpp/req')

const dh = require('./display-helpers.js')

function start(store, log) {
  let prev

  store.react("userinfo", ui => {
    let curr = {
      ui,
      store: store.fork()
    }

    if(!prev || prev.ui.id == curr.ui.id) {
      startWorkflow(log, curr)
    } else {
      stopWorkflow(log, prev, () => {
        prev.store.destroy()
        startWorkflow(curr)
      })
    }

  })
}

function stopWorkflow(log, ctx, cb) {
  if(ctx.stopped) return cb()
  else ctx.reqStop = cb
}

function startWorkflow(log, ctx) {
  run_1()

  function run_1() {
    if(ctx.reqStop) return stop_1(ctx)
    let serverURL = ctx.store.get("settings.serverURL")
    if(!valid_url_1(serverURL)) {
      if(ctx.badServerURL && ctx.badServerURL != serverURL) {
        ctx.badServerURL = serverURL
        log("workflow/badServerURL", serverURL)
      }
      next_1(5000)
    } else {
      if(!ctx.store.get("users")) {
        log("workflow/gettingUsers")
        getUsers(serverURL, ctx.ui, (err, users) => {
          if(err) {
            log("err/workflow/gettingUsers", err)
            next_1(5000)
          } else {
            log("workflow/gotUsers", { num: users.length })
            log.trace("workflow/gotUsers", users)
            store.event("set/users", users)
            next_1(100)
          }
        })
      } else {
        next_1(1000)
      }
    }
  }

  function next_1(delay) {
    if(!ctx.reqStop) return setTimeout(run_1, delay)
    else stop_1(ctx)
  }

  function stop_1(ctx) {
    ctx.stopped = true
    ctx.reqStop()
  }

  function valid_url_1(u) {
    try {
      u = new URL(u)
      return u.protocol == "http:" || u.protocol == "https:"
    } catch(e) {
      return false
    }
  }

}

function getUsers(serverURL, ui, cb) {
  let p = serverURL
  if(!p.endsWith("/")) p += "/"
  p += "/dapp/v2/myusers"

  req.post(p, {
    id: ui.id,
    seed: ui.seed,
    authKey: ui.authKey
  }, cb)
}

module.exports = {
  start,
}
