'use strict'
const bdb = require('baby-db')

const TASKS = {}
let maxid = 0
let ondone_

const taskdb = bdb('tasks.json')
taskdb.on('error', err => console.error(err))
taskdb.on('rec', rec => {
  if(!rec.id) throw `Missing id ${JSON.stringify(rec)}`
  if(!rec.action) throw `Missing action: ${JSON.stringify(rec)}`
  if(!rec.userid) throw `Missing user: ${JSON.stringify(rec)}`
  if(rec.id > maxid) maxid = rec.id
  if(TASKS[rec.id]) Object.assign(TASKS[rec.id], rec)
  else TASKS[rec.id] = rec
})
taskdb.on('done', () => {
  console.log('Task DB loaded...')
  ondone_ && ondone_()
})

function add(task) {
  task.id = task.id || ++maxid
  taskdb.add(task)
}

function getFor(users) {
  const ret = []
  for(let k in TASKS) {
    if(belongs_1(users, TASKS[k])) ret.push(TASKS[k])
  }
  return ret

  function belongs_1(users, task) {
    for(let i = 0;i < users.length;i++) {
      if(users[i] == task.userId) return true
    }
  }
}

module.exports = {
  add,
  getFor,
  ondone: cb => ondone_ = cb,
}
