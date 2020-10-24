'use strict'
const ss = require('string-similarity')
const kc = require('../../kafclient.js')

/*    understand/
 * as the avatar performs tasks it records them in the
 * user's log file. We look through this file to get a
 * handle of the various tasks the user has performed
 * and is performing - keeping track of them in the
 * store
 *
 *      way/
 * we periodically check for new log records and process
 * them - finding duplicate tasks and keeping track of
 * their status
 */
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
    log("userStatus/checking", {
      name: curr.name, from: curr.from
    })

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
      for(let k in uts) {
        log("userStatus/got", {
          name: uts[k].name, from: uts[k].from
        })
      }
      for(let k in userTasks) {
        if(!uts[k]) uts[k] = userTasks[k]
      }
      store.event("userTasks/set", uts)
    }
    cb()
  }

  function process_1(msg, ut) {
    let t = findDuplicate(ut.tasks, msg.data)
    if(!t) {
      if(!msg.data || !msg.data.task) {
        log("err/processing/unknown", { msg })
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
        log("err/processing/type", { msg })
    }
  }

}

/*    problem/
 * a problem we faced when running linked in tasks was that
 * sometimes the server would ask us to do the same thing
 * again - either because of some back-end issue or because
 * we did not correctly inform it that it had been done.
 * In some cases, this does not matter - viewing a profile
 * is not a big issue, or checking for a message response
 * for example - but in some cases it really makes a diff-
 * erence - notably in sending messages. We don't want to
 * spam the user with duplicate messages.
 *
 *    way/
 * we look for earlier tasks that could be duplicates of
 * this one - either a "real" duplicate (with matching id)
 * or one that has similar data (connecting to the same
 * user, sending the same message to the same user etc)
 */
function findDuplicate(tasks, data) {
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

/*    way/
 * return all the users we manage - the logged in user
 * and addional managed users that the logged in user
 * manages
 */
function getUis(store) {
  let ui = store.get("ui")
  let users = store.get("users")
  if(users) users = users.concat(ui)
  else users = [ ui ]
  return users
}

/*    way/
 * check if two message strings are similar enough to
 * be considered the "same"
 *    eg: "How are you? Let's connect"
 *    and "How are you? Let us connect"
 *
 * used to check for duplicate tasks
 */
function isSimilar(s1, s2) {
  if(!s1 && !s1) return true
  if(!s1 || !s2) return false
  return ss.compareTwoStrings(s1.toLowerCase(), s2.toLowerCase()) > 0.9
}

module.exports = {
  userStatus,
}
