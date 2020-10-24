'use strict'
const ss = require('string-similarity')
const req = require('@tpp/req')
const kc = require('../../kafclient.js')
const chat = require('./chat.js')

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
    if(ndx >= users.length) return cb()
    let ui = users[ndx]
    let curr = getUserTasks(store, ui.id)
    log("userStatus/checking", {
      name: curr.name, from: curr.from
    })

    kc.get(curr.name, (recs, from) => {

      let ut = getUserTasks(store, ui.id, true)
      ut.from = from
      recs.forEach(msg => process_1(msg, ut.tasks))
      store.event("user/tasks/set", ut)

    }, (err, end) => {

      if(err) {
        log("err/userStatus/get", err)
        return 0
      }
      if(end) {
        let ut = getUserTasks(store, ui.id)
        if(ut.from != curr.from) {
          log("userStatus/got", {
            name: ut.name, from: ut.from
          })
        }
        get_ndx_1(ndx+1)
        return 0
      }
      return 10

    }, curr.from)

  }

  function process_1(msg, tasks) {
    if(!msg.data || !msg.data.task) {
      log("err/processing/unknown", { msg })
      return
    }
    let t = findDuplicate(tasks, msg.data.task)
    if(!t) {
      t = msg.data.task
      tasks.push(t)
    }
    if(!t.status) t.status = []
    t.status = t.status.concat({
      e: msg.e,
      t: msg.t,
    })
  }

}

/*    way/
 * periodically get tasks from the server and add them to
 * the userTasks list - checking that they have not already
 * been added (non-duplicate tasks)
 */
function serverTasks({vars, store, say, log}, cb) {
  const CHECK_EVERY = 2 * 60 * 1000
  let last = store.get("lastServerTasks")
  if(!last) last = 0
  if(Date.now() - last < CHECK_EVERY) return cb()
  store.event("lastServerTasks/set", Date.now())

  let users = getUis(store)
  let forUsers = users.map(ui => {
    return {
      id: ui.id, seed: ui.seed, authKey: ui.authKey
    }
  })
  log("serverTasks/getting", { forUsers })
  let ui = store.get("ui")
  say(chat.gettingTasks(), () => {

    let p = `${vars.serverURL}/dapp/v2/tasks`
    req.post(p, {
      id: ui.id,
      seed: ui.seed,
      authKey: ui.authKey,
      forUsers,
    }, (err, resp) => {
      if(err) {
        log("err/serverTasks", err)
        cb(chat.errGettingTasks())
      } else {
        let tasks = resp.body
        log("serverTasks/got", { num: tasks.length })
        log.trace("serverTasks/gottasks", tasks)
        tasks = filter_1(tasks)
        say({
          from: -1,
          chat: chat.gotTasks(tasks),
        }, () => 1)
        setTimeout(() => {
          if(tasks && tasks.length) {
            tasks.forEach(task => {
              let ut = getUserTasks(store, task.userId, true)
              task.status = [{
                e: "task/new",
                t: Date.now(),
              }]
              ut.tasks = ut.tasks.concat(task)
              store.event("user/tasks/set", ut)
            })
          }
          cb()
        }, 200)
      }
    })
  })

  /*    way/
   * filter out duplicate tasks the server has sent us
   */
  function filter_1(tasks) {
    let r = []
    for(let i = 0;i < tasks.length;i++) {
      let task = tasks[i]
      let ut = getUserTasks(store, task.userId)
      let t = findDuplicate(ut.tasks, task)
      if(!t) r.push(task)
    }
    return r
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
function findDuplicate(tasks, task) {
  if(!task || !tasks || !tasks.length) return

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
 * return the current user tasks from the store - returning
 * a copy is requested for modification
 */
function getUserTasks(store, id, formodif) {
  let userTasks = store.get("userTasks")
  if(userTasks && userTasks[id]) return cin_1(userTasks[id])
  else {
    return {
      id,
      name: `User-${id}`,
      from: 1,
      tasks: [],
    }
  }

  /*    understand/
   * copy the user tasks passed in if needed (copying is
   * needed for modification)
   */
  function cin_1(ut) {
    if(!formodif) return ut
    return {
      id: ut.id,
      name: ut.name,
      from: ut.from,
      tasks: ut.tasks.map(t => Object.assign({}, t)),
    }
  }
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
  fromServer: serverTasks,
}
