'use strict'
const dux = require('@tpp/dux')

const store_ = require('./store.js')
const kc = require('../kafclient.js')

const toolbar = require('./toolbar.js')
const logview = require('./logview.js')
const login = require('./login.js')
const home = require('./home.js')

import "./main.scss"

/*    understand/
 * main entry point - it all starts here
 */
function main() {
  let cont = document.getElementById("cont")
  window.get.logname().then(({name,DEBUG}) => {
    window.store = store_(name, DEBUG, cont)
    showUI(window.store)
    fetchLogs(window.store)
  })
}

function showUI(store) {
  toolbar.show(store)
  logview.show(store)

  let curr
  store.react('ui', ui => {
    if(curr) store.destroy(curr)
    curr = store.fork()
    if(!ui) login.show(curr)
    else home.show(curr)
  })

}

function fetchLogs(store) {
  let logs = []
  kc.get(store.get("logname"), latest => {
    logs = logs.concat(latest)
    store.event("logs/set", logs)
  }, (err, end) => {
    if(err) console.error(err)
    if(end) return 5 * 1000
    return 200
  })
}

main()
