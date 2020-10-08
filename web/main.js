'use strict'
const dux = require('@tpp/dux')

const store_ = require('./store.js')

const logview = require('./logview.js')
const toolbar = require('./toolbar.js')
const login = require('./login.js')
const home = require('./home.js')

import "./main.scss"

/*    understand/
 * main entry point - it all starts here
 */
function main() {
  let cont = document.getElementById("cont")
  window.store = store_(window.logname, cont)
  showUI(window.store)
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

main()
