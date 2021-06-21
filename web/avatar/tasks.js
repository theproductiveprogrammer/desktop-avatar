'use strict'
const ss = require('string-similarity')
const req = require('@tpp/req')
const kc = require('../../kafclient.js')
const chat = require('./chat.js')
const ww = require('./ww.js')

/*    understand/
 * as the avatar performs tasks it records them in the
 * user's log file. We look through this file to get a
 * handle of the various tasks the user has performed
 * and is performing - keeping track of them in the
 * store
 *
 *      way/
 * we periodically check for new log records and process
 * them - both task records and their status.
 */
function userStatus({store, log}, cb) {
  const expecting = store.get("expectlogs")
  if(expecting) {
    log.trace("expect/logs")
    setTimeout(() => do_1(), 10000)
  } else {
    const CHECK_EVERY = 30 * 1000
    let last = store.get("time.lastUserStatus")
    if(!last) last = 0
    if(Date.now() - last < CHECK_EVERY) return cb()
    store.event("lastUserStatus/set", Date.now())
    do_1()
  }

  function do_1() {
    let users = store.getUsers()
    process_ndx_1(0)

    function process_ndx_1(ndx) {
      if(ndx >= users.length) return cb()
      const ui = users[ndx]
      const from = store.getMsgFrom(ui.id)
      const name = `User-${ui.id}`
      log.trace("userStatus/checking", { name, from })

      kc.get(name, (recs, from) => {

        store.event("from/set", { userId: ui.id, from })
        let unique_tasks = local_dedupe(recs)
        let new_tasks_list = []
        let tasks_status_list = []
        unique_tasks.forEach(msg => {
          if(msg.e.startsWith("trace/")) {
            /* ignore */
          } else if(msg.e === "task/new") {
            new_tasks_list.push(msg.data)
          } else if(msg.e === "task/status") {
            msg.data.t = msg.t
            tasks_status_list.push(msg.data)
          } else {
            log("err/processing/unknown", { msg })
          }
        })
        store.event("task/add", new_tasks_list)
        store.event("status/add", tasks_status_list)
      }, (err, end) => {

        if(err) {
          log("err/userStatus/get", err)
          process_ndx_1(ndx+1)
          return 0
        }

        if(!end) return 10

        let curr = store.getMsgFrom(ui.id)
        if(curr != from) {
          log("userStatus/got", { name, from })
          if(expecting) store.event("expect/logs", false)
        }
        process_ndx_1(ndx+1)
        return 0

      }, from)
    }

  }
}
/* problem
* There might be duplicates tasks present in the logs.  
* Some of the tasks present may have duplicates
* way
* Filter out duplicate tasks and have a set of unique tasks
*/

function local_dedupe(tasks){
  let newtasks = []
  let taskwithstatus = []
  let uniquetasks = [] 
  for(let i =0;i<tasks.length;i++){
  if(tasks[i].e == "task/new"){
      if(!newtasks.includes(tasks[i].data.id)) {
          newtasks.push(tasks[i].data.id)
          uniquetasks.push(tasks[i])
      }    
  }else if(tasks[i].e == "task/status"){
      if(!taskwithstatus.includes(tasks[i].data.id)){
          taskwithstatus.push(tasks[i].data.id)
          uniquetasks.push(tasks[i])
      }
    else{
      uniquetasks.push(tasks[i])
      }
    }
  }
  return uniquetasks
}

/*    way/
 * periodically get tasks from the server and add them to
 * the user's log file for processing checking that they
 * are not duplicate as the server will keep sending us
 * the same tasks until we inform them it is done.
 *
 *    problem/
 * when we add a task, we tell the user about it but the
 * system itself picks up the task from the user log which
 * can longer. So we reach an absurd state where the USER
 * knows more about the state of the system than the SYSTEM
 * itself!
 *    way/
 * we will place a 'notice' on the store that new logs are
 * expected - this will allow other processes to decide
 * to read them earlier and/or handle delays and messages.
 */
function serverTasks({vars, store, say, log}, cb) {
  const CHECK_EVERY = 2 * 60 * 1000
  const last = store.get("time.lastServerTasks") || 0
  if(Date.now() - last < CHECK_EVERY) return cb()
  store.event("lastServerTasks/set", Date.now())

  const users = store.getActiveUsers()
  log("serverTasks/getting", {forUsers:users.map(u=>u.id)})
  const ui = store.get("user.ui")
  say(chat.gettingTasks(), () => {

    const forUsers = users.map(ui => {
      return {
        id: ui.id, seed: ui.seed, authKey: ui.authKey
      }
    })

    const p = `${vars.serverURL}/dapp/v2/tasks`
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
        let tasks = resp.body || []
        log("serverTasks/got", { num: tasks.length })
        log.trace("serverTasks/gottasks", tasks)
        tasks = server_dedupe(tasks)
        tasks = skipCheckConnectTask(tasks)
        say({
          from: -1,
          chat: chat.sentTasks(tasks),
        }, () => {
          if(!tasks || !tasks.length) return cb()
          ww.add.tasks(tasks)
            .then(() => {
              store.event("expect/logs", true)
              cb()
            })
            .catch(err => {
              log("err/adding/tasks", err)
              cb()
            })
        })
      }
    })
  })


  /* problem
  * Filter out duplicate tasks the server has sent us also 
  * there are chances that there may be duplicates among 
  * existing tasks as well. 
  * Way
  * We need to  filter it out and get the unique tasks as well
  */

  function server_dedupe(tasks) {
    const existing = store.get("user.tasks")
    let existing_ids = []
    let sorted_existing = []
    existing.forEach(element => {
      if(!existing_ids.includes(element.id)){
          existing_ids.push(element.id)
          sorted_existing.push(element)            
      }        
    });
    let tasks_ids = []
    let sorted_tasks = []
    tasks.forEach(element => {
        if(!tasks_ids.includes(element.id)){
          tasks_ids.push(element.id)
          sorted_tasks.push(element)            
        }        
    });
    let r = []
    for(let i = 0;i < sorted_tasks.length;i++) {
      const task = sorted_tasks[i]
      const t = findDuplicate(sorted_existing, task)
      if(!t) r.push(task)
    }
    return r
  }

  /**
   *   way/
   * skip check connect task if withdraw connection task is there for a specific profile
   */
  function skipCheckConnectTask(tasks) {
    let r = []
    let withdrawTask = []
    let checkConnectTask = []
    for(let i = 0; i < tasks.length; i++) {
      if(tasks[i].action == 'LINKEDIN_DISCONNECT'){
        withdrawTask.push(tasks[i])
        r.push(tasks[i])
      }
      else if (tasks[i].action == 'LINKEDIN_CHECK_CONNECT')
        checkConnectTask.push(tasks[i])
      else
        r.push(tasks[i])
    }
    for(let i=0 ; i < checkConnectTask.length;i++){
      if(!isWithdrawConnectionExist(withdrawTask, checkConnectTask[i].linkedInURL)) r.push(checkConnectTask[i])
    }
    return r

    function isWithdrawConnectionExist(arr, linkedInURL) {
      var found = false;
      for(var i = 0; i < arr.length; i++) {
        if (arr[i].linkedInURL == linkedInURL) {
          found = true;
          break;
        }
      }
      return found
    }
  }

}

/*    way/
 * send finished task status's and notifications to the server,
 * ignoring those that have already been sent (status 202)
 */
function sendToServer({vars, store, say, log}, cb) {
  const tasks = store.get("user.tasks")
  const ts = tasks.map(t => store.getTaskStatus(t.id))
  const status = ts.filter(s => s && s.code >= 200 && s.code != 202)

  const statusUpdates = status.map(s => {
    const status = s.code == 200 ? "success" : "failed"
    let updt = { id: s.id, status }
    if(s.notify) updt.notify = s.notify
    if(s.notifydata) updt.notifydata = s.notifydata
    return updt
  })

  if(!status.length) return {}
  log("sendToServer/statusUpdates", { num: status.length })

  const ui = store.get("user.ui")
  const p = `${vars.serverURL}/dapp/v2/status`

  const users = store.get("user.users")
  users.push(ui)
  for(let i=0; i < users.length;i++) {
    const user = users[i]
    const status_s = statusUpdates.filter(s => store.getTask(s.id).userId == user.id)
    if(!status_s || !status_s.length) continue

    req.post(p, {
      id: user.id,
      seed: user.seed,
      authKey: user.authKey,
      statusUpdates: status_s
    }, (err, resp) => {
      if(err) {
        log("err/sendToServer", err)
        cb(chat.errSendingStatus())
      } else {
        const tasks = status_s.map(s => store.getTask(s.id))
        say({
          from: -1,
          chat: chat.gotStatus(tasks),
        }, () => {
          ww.add.sent(tasks)
            .then(() => cb())
            .catch(err => {
              log("err/recordingSend", err)
              cb()
            })
        })
      }
    })
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
    if(curr.userId !== task.userId) continue
    switch(task.action) {
      case "LINKEDIN_CONNECT":
        if(curr.linkedInURL == task.linkedInURL) return curr
        break;
      case "LINKEDIN_MSG":
        if(curr.linkedInURL == task.linkedInURL
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
  sendToServer,
}
