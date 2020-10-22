'use strict'
const ss = require('string-similarity')
const kc = require('../../kafclient.js')

function userStatus({store, log}, cb) {
  const CHECK_EVERY = 10 * 1000
  let last = store.get("lastUserStatus")
  if(!last) last = 0
  if(Date.now() - last < CHECK_EVERY) return cb()
  store.event("lastUserStatus/set", Date.now())

  let users = getUis(store)
  let userTasks = store.get("userTasks") || {}
  let uts = {}
  get_ndx_1(0)

  function get_ndx_1(ndx) {
    if(ndx >= users.length) return done_1()
    let ui = users[ndx]
    let curr = userTasks[ui.id]
    if(!curr) curr = {
      name: `User-${ui.id}`,
      from: 1,
      tasks: [],
    }

    kc.get(curr.name, recs => {
      if(!uts[ui.id]) uts[ui.id] = copy_1(curr)
      recs.forEach(msg => process_1(msg, uts[ui.id]))
    }, (err, end, from) => {
      if(err) {
        log("err/userStatus/get", err)
        return 0
      }
      if(end) {
        if(uts[ui.id]) uts[ui.id].from = from
        get_ndx_1(ndx+1)
        return 0
      }
      return 10
    }, curr.from)

  }

  function copy_1(curr) {
    return {
      name: curr.name,
      from: curr.from,
      tasks: curr.tasks.map(t => Object.assign({}, t)),
    }
  }

  function done_1() {
    if(Object.keys(uts).length) {
      for(let k in userTasks) {
        if(!uts[k]) uts[k] = userTasks[k]
      }
      store.event("userTasks/set", uts)
    }
    cb()
  }

  function process_1(msg, ut) {
    let t = find_matching_1(ut.tasks, msg.data)
    if(!t) {
      if(!msg.data || !msg.data.task) {
        log.trace("err/processing/unknown", { msg })
        return
      }
      t = msg.data.task
      ut.tasks.push(t)
    }
    if(!t.status) t.status = []
    switch(msg.e) {
      case "task/new":
        t.status = t.status.concat("new", msg.t)
        break;
      case "task/done":
        t.status = t.status.concat("done", msg.t)
        break;
      case "err/task/failed":
        t.status = t.status.concat("failed", msg.t)
        break;
      default:
        log.trace("err/processing/type", { msg })
    }
  }

  function find_matching_1(tasks, data) {
    if(!data || !tasks || !data.task || !tasks.length) return

    let task = data.task
    for(let i = 0;i < tasks.length;i++) {
      let curr = tasks[i]
      if(task.id && curr.id === task.id) return curr
      if(curr.action !== task.action) continue
      switch(task.action) {
        case "LINKEDIN_CONNECT":
          if(curr.linkedinURL == task.linkedinURL) {
            return curr
          }
          break;
        case "LINKEDIN_MSG":
          if(curr.linkedinURL == task.linkedinURL
              && isSimilar(curr.msg, task.msg)) {
            return curr
          }
          break;
        case "LINKEDIN_VIEW":
          break;
        case "LINKEDIN_CHECK_CONNECT":
          break;
        case "LINKEDIN_DISCONNECT":
          break;
        case "LINKEDIN_CHECK_MSG":
          break;
      }
    }
  }
}

function getUis(store) {
  let ui = store.get("ui")
  let users = store.get("users")
  if(users) users = users.concat(ui)
  else users = [ ui ]
  return users
}

function isSimilar(s1, s2) {
  if(!s1 && !s1) return true
  if(!s1 || !s2) return false
  return ss.compareTwoStrings(s1.toLowerCase(), s2.toLowerCase()) > 0.9
}

module.exports = {
  userStatus,
}
