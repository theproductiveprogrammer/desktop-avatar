'use strict'
const { h } = require('@tpp/htm-x')
const dux = require('@tpp/dux')

const store = require('./store.js')
const kc = require('../kafclient.js')
const lg = require('../logger.js')

const toolbar = require('./toolbar.js')
const logview = require('./logview.js')
const login = require('./login.js')
const home = require('./home.js')
const avatar = require('./avatar.js')

import "./main.scss"

/*    understand/
 * main entry point - it all starts here
 */
function main() {
  window.store = store

  window.get.logname().then(({name,DEBUG}) => {
    let log = lg(name, DEBUG)
    showUI(log, store)
    setupPolling(log, store)
    setupTimer(log, store)
    avatar.start(log, store)
  })
}

function showUI(log, store) {
  let cont = h("#cont")
  document.body.appendChild(cont)

  let main = h('.main')
  let footer = h('.footer',
    h('span', [
      "POWERED BY ",
      h("a", {
        href: "http://salesboxai.com",
      }, "http://salesboxai.com")
    ])
  )

  cont.c(
    toolbar.e(log, store),
    logview.e(log, store),
    main,
    footer,
  )

  let curr = {}
  store.react('ui', ui => {
    if(curr.store) store.destroy(curr.store)

    curr.store = store.fork()
    if(!ui) curr.page = login.e(log, curr.store)
    else curr.page = home.e(ui, log, curr.store)

    main.c(curr.page)
  })

}

function setupPolling(log, store) {
  fetchSettings(log, store)
  fetchLogs(log, store)
}

function setupTimer(log, store) {
  store.event("timer/tick", new Date())
  setInterval(() => {
    store.event("timer/tick", new Date())
  }, 15000)
}

function fetchSettings(log, store) {
  kc.get("settings", latest => {
    store.event("settings/set", latest[latest.length-1])
  }, (err, end) => {
    if(err) console.error(err)
    if(end) return 5 * 1000
    return 500
  })
}

function fetchLogs(log, store) {
  let logs = []
  kc.get(log.getName(), latest => {
    logs = logs.concat(latest)
    store.event("logs/set", logs)
  }, (err, end) => {
    if(err) console.error(err)
    if(end) return 5 * 1000
    return 200
  })
}

main()
