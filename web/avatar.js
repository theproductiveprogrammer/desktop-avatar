'use strict'

const dh = require('./display-helpers.js')

function start(log, store) {
  let curr
  store.react('ui', ui => {
    if(curr && curr.id != ui.id) sayBye(curr, store)
    curr = ui
    sayHi(log, store, ui)
  })
}

function sayHi(log, store, ui) {
  if(!ui) return
  store.event("msg/add", {
    from: ui.id,
    txt: `${dh.greeting()} ${dh.userName(ui)}`
  })
}

function sayBye(ui, store) {
  store.event("msg/add", {
    from: ui.id,
    txt: `Bye ${dh.userName(ui)}`
  })
}

module.exports = {
  start,
}
