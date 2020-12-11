'use strict'
const chat = require('./chat.js')

/*    way/
 * randomly sleep for a while to avoid overwhelming the
 * server
 */
function takeANap(env, cb) {
  const expecting = env.store.get("expectlogs")
  let delay
  if(expecting) delay = Math.random() * 1000
  else delay = Math.random() * 20000 + 1000
  setTimeout(() => cb(), delay)
}

/*    way/
 * schedule work for every user, chatting when we do so
 */
function work({store, log, say}, cb) {
  let chatting = false
  store.getActiveUsers().forEach(schedule_work_1)
  if(!chatting) return {}

  /*    way/
   * if the user does not have work-in-progress, schedule
   * a new task he can do
   *    ...if he's not too tired (rate-limiting!)
   *
   *    problem/
   * the task is scheduled by the main process who does the
   * work. But that means that until we pull the latest
   * status updates from the user log we will not know
   * that the task is scheduled and could schedule it again
   *
   *    way/
   * we will insert a "dummy" status record in the store
   * that mimics the fact that the task has been scheduled.
   * Having duplicate / similar records is not a problem
   * as we can easily handle log messages.
   */
  function schedule_work_1(user) {
    const tasks = store.getTasks(user.id)
    if(!tasks || !tasks.length) return

    if(wip_1(tasks)) return
    if(too_tired_1(user, tasks)) return
    if(too_lazy_1(user)) return

    const task = pick_task_1(tasks)
    if(!task) return

    chatting = true
    log("scheduling/work", { task })
    const auth = {
      id: user.id,
      linkedinUsername: user.linkedinUsername,
      linkedinPassword: user.linkedinPassword,
    }
    window.x.cute(auth, task)
      .then(msg => {
        store.event("status/add", {
          t: (new Date()).toISOString(),
          id: task.id,
          msg: "task/started/dummy",
          code: 102
        })
        store.event("expect/logs", true)
        cb({ from: user, chat: msg })
      })
      .catch(err => {
        log("err/schedule/work", err)
        cb({
          from: user,
          msg: chat.errScheduleWork(err)
        })
      })
  }

  /*    way/
   * check for any new tasks or re-started tasks
   */
  function pick_task_1(tasks) {
    for(let i = 0;i < tasks.length;i++) {
      const curr = tasks[i]
      const status = store.getTaskStatus(curr.id)
      if(!status || status.code === 0) return curr
    }
  }

  /*    way/
   * check for any tasks that are not done
   */
  function wip_1(tasks) {
    for(let i = 0;i < tasks.length;i++) {
      const status = store.getTaskStatus(tasks[i].id)
      if(status && status.code == 102) return true
    }
    return false
  }

  /*    way/
   * check limits on tasks done this hour / today
   */
  function too_tired_1(user) {
    let hr = 0
    let day = 0
    const now = Date.now()
    const status = store.get("user.status")
    for(let i = 0;i < status.length;i++) {
      const s = status[i]
      if(s.id == user.id) {
        const t = new Date(s.t).getTime()
        if(now - t < 60 * 60 * 1000) hr++
        if(now - t < 24 * 60 * 60 * 1000) day++
      }
    }
    if(hr > 20) return true
    if(day > 300) return true
    return false
  }

  /*    way/
   * randomly decide the user is too lazy
   */
  function too_lazy_1(user) {
    return Math.random() < 0.3
  }
}

let ACTIVEUSERS = {
  when: 0,
  ndx: 0,
}

/*    problem/
 * machines have limitations as to the number of simultaneous
 * puppeteer browsers that can reasonably be open. As we have a
 * a one-browser-per-user policy we may need to pick a set of
 * users to do jobs at any given time to avoid overwhelming
 * the machine.
 *    way/
 * Every hour or so we pick a new set of users to perform tasks
 */
function pickUsers(env, cb) {
  const mxbr = env.store.get("settings.maxbrowsers")
  const users = env.store.getUsers()
  const activeusers = pick_new_1(users, mxbr)
  if(!activeusers) return
  env.store.event("activeusers/set", activeusers)
  window.clear.browsers()
  cb()

  /*    way/
   * If the max browser setting is less than the actual
   * number of users then every hour we rotate through
   * the list of users
   */
  function pick_new_1(users, mxbr) {
    if(!users || !users.length) return
    mxbr = parseInt(mxbr)
    if(isNaN(mxbr) || mxbr >= users.length) return
    const n = Date.now()
    if((n - ACTIVEUSERS.when) < 1000 * 60 * 60) return
    const ndx = (ACTIVEUSERS.ndx + 1) % users.length
    ACTIVEUSERS.when = n
    ACTIVEUSERS.ndx = ndx
    return users.concat(users).slice(ndx, ndx+mxbr)
  }
}


module.exports = {
  pickUsers,
  takeANap,
  work,
}
