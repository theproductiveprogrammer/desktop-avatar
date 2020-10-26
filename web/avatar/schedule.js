'use strict'

/*    way/
 * randomly sleep for a while to avoid overwhelming the
 * server
 */
function takeANap(env, cb) {
  let delay = Math.random() * 20000 + 1000
  setTimeout(() => cb(), delay)
}

/*    way/
 * if the user has completed the last tasks assign him
 * another
 */
function tasks({store,log,say}, cb) {
  const userTasks = store.get("user.userTasks")
  if(!userTasks) return cb()
  for(let k in userTasks) {
    let ut = userTasks[k]
    if(!ut.assigned || finished_work_1(ut)) {
      log.trace("user/task/done", ut)
      let prev = ut.assigned
      let assigned = assign_1(ut)
      if(assigned) {
        store.event("user/task/assign", assigned)
        log.trace("user/task/assigned", assigned)
      } else {
        if(prev) store.event("user/task/unassign", prev)
        tell_user_about_1(ut, prev)
      }
    }
  }
  cb()

  /*    way/
   * find the corresponding task's status and get the chat
   * from the plugin to tell the user
   */
  function tell_user_about_1(ut, task) {
    if(!task) return cb()
    for(let i = 0;i < ut.tasks.length;i++) {
      let t = ut.tasks[i]
      if(t.id == task.id) {
        if(!t.status || !t.status.length) return cb()
        let status = t.status[t.status.length-1].data
        if(status && status.data) status = status.data.status
        if(!status) status = 200
        window.get.taskchat(task, status)
          .then(msg => {
            say(msg, () => 1)
          })
          .catch(e => log("err/tellinguser", e))
        return
      }
    }
  }

  /*    way/
   * see if there are any tasks that can be assigned
   */
  function assign_1(ut) {
    for(let i = 0;i < ut.tasks.length;i++) {
      let task = ut.tasks[i]
      if(task_done_1(task)) continue
      return task
    }
  }

  /*    way/
   * check if the assigned task is not done
   */
  function finished_work_1(ut) {
    for(let i = 0;i < ut.tasks.length;i++) {
      let task = ut.tasks[i]
      if(task.id === ut.assigned.id) return task_done_1(task)
    }
    log("err/scheduleTasks/badAssignment", { assigned })
  }

  /*    way/
   * a task is done when it's not new or started
   */
  function task_done_1(task) {
    if(!task.status || !task.status.length) return false
    let s = task.status[task.status.length-1].e
    return !(s === "task/new" || s === "task/started")
  }

}

module.exports = {
  takeANap,
  tasks,
}
