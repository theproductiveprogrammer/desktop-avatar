'use strict'

const dh = require('./display-helpers.js')

function start(log, store) {
  let curr
  store.react('ui', ui => {
    if(curr && !ui) sayBye(curr, store)
    curr = ui
    sayHi(log, store, ui)
  })
}

function sayHi(log, store, ui) {
  if(!ui) return
  let bot = ui
  for(let i = 0;i < ui.bots.length;i++) {
    if(ui.bots[i].logo) bot = ui.bots[i]
  }
  store.event("msg/add", {
    t: (new Date()).toISOString(),
    from: bot.id,
    txt: `${dh.greeting()} ${dh.userName(ui)}`
  })
  setTimeout(() => {
  store.event("msg/add", {
    t: (new Date()).toISOString(),
    from: bot.id,
    txt: `This is a test

This is a test 123

This is a test123

This is a test123`
  })}, 1000)
  setTimeout(() => {
  store.event("msg/add", {
    t: (new Date()).toISOString(),
    from: bot.id,
    txt: `This is a test

:cool: :rocket:


This is a test 123



This is a test123



This is a test123`
  })}, 2000)
  store.event("msg/add", {
    t: (new Date()).toISOString(),
    from: bot.id,
    txt: dh.smiley() + dh.anEmoji("dancer"),
  })
  setTimeout(() => {
  store.event("msg/add", {
    t: (new Date()).toISOString(),
    from: bot.id,
    txt: `${dh.greeting()} ${dh.userName(ui)}`
  })}, 3000)
  setTimeout(() => {
  store.event("msg/add", {
    t: (new Date()).toISOString(),
    from: bot.id,
    txt: `This is a test
This is a test 123
This is a test123
This is a test123`
  })}, 4000)
  setTimeout(() => {
  store.event("msg/add", {
    t: (new Date()).toISOString(),
    from: bot.id,
    txt: `${dh.greeting()} ${dh.userName(ui)}`
  })}, 5000)
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
