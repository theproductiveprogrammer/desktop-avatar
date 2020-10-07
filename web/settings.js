'use strict'
const { h } = require('@tpp/htm-x')

const db = require('./db.js')

import "./settings.scss"

const NAME = "settings"

/*    understand/
 * Main entry point
 */
function main() {
  let settings

  let cont = document.getElementById("cont")
  cont.innerHTML = ""

  let title = h(".title", "Settings")
  cont.appendChild(title)

  let form = h(".form")
  cont.appendChild(form)

  let svr = h("input.svr", {
    placeholder: "https://app3.salesbox.ai",
  })

  let submit = h(".submit", {
    tabindex: 0,
    onclick: submit_1,
    onkeydown: e => {

      if(e.keyCode == 13
        || e.key == "Enter"
        || e.code == "Enter") {
        e.preventDefault()
        submit_1()
      }
      if(e.keyCode == 32
        || e.key == "Space"
        || e.code == "Space") {
        e.preventDefault()
        submit_1()
      }

    },
  }, "Submit")


  db.get(NAME, latest => {
    settings = latest[latest.length-1]
  }, (err, end) => {
    if(err) console.error(err)
    if(end) {
      if(settings) {
        svr.value = settings.serverURL
      }
      return 0
    }
    return 1
  })

  form.c(
    h(".label", "Server URL"),
    svr,
    submit
  )

  function submit_1() {
    let svrURL = svr.value
    if(!svrURL) {
      svr.focus()
      return
    }
    if(!valid_1(svrURL)) {
      alert("Invalid server URL")
      svr.focus()
      return
    }
    if(!settings) settings = {}
    settings.t = (new Date()).toISOString()
    settings.serverURL = svrURL
    db.put(settings, NAME)
    window.close()
  }

  function valid_1(u) {
    try {
      u = new URL(u)
      return u.protocol == "http:" || u.protocol == "https:"
    } catch(e) {
      return false
    }
  }

}

main()
