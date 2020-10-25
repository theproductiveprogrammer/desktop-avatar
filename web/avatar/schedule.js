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
function tasks({store,log}, cb) {
  const userTasks = store.get("user.userTasks")
  if(!userTasks) return cb()
  for(let k in userTasks) {
    let ut = userTasks[k]
    if(!ut.assigned || finished_work_1(ut)) {
      let assigned = assign_1(ut)
      if(assigned) store.event("user/task/assign", assigned)
    }
  }
  cb()

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
