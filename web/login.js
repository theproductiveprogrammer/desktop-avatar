'use strict'
const { h } = require('@tpp/htm-x')
const req = require('@tpp/req')

const lg = require('../logger.js')

import "./login.scss"

function show(store) {
  let log = lg(store.get("logname"), store.get("DEBUG"))

  let form = h(".loginForm")
  cont.appendChild(form)

  let title = h(".title", "Login")
  let inputs = h(".inputs")
  let name = h("input.name", {
    autofocus: true,
    placeholder: "Email or Username",
    onkeydown: e => {
      if(e.keyCode == 13
        || e.key == "Enter"
        || e.code == "Enter") {
        e.preventDefault()
        pw.focus()
      }
    },
  })
  let pw = h("input.name", {
    type: "password",
    placeholder: "Password",
    onkeydown: e => {
      if(e.keyCode == 13
        || e.key == "Enter"
        || e.code == "Enter") {
        e.preventDefault()
        submit_1()
      }
    },
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
  },"Login")

  form.c(
    title,
    inputs.c( name, pw ),
    submit
  )


  function submit_1() {
    window.get.settings().then(settings => {
      let serverURL = settings.serverURL
      if(!serverURL || !serverURL.trim()) {
        log.trace("err/login/emptyServerURL")
        alert("Please set the server URL in settings")
        window.show.settings()
        return
      }
      let usr = name.value
      let pwd = pw.value
      if(!usr) {
        log.trace("err/login/emptyName")
        form.classList.add('err')
        name.focus()
        setTimeout(() => form.classList.remove('err'), 1000)
        return
      }
      if(!pwd) {
        log.trace("err/login/emptyPassword")
        form.classList.add('err')
        pw.focus()
        setTimeout(() => form.classList.remove('err'), 1000)
        return
      }
      let u = dappURL(serverURL) + "/login"
      log.trace("login/request", usr)
      req.post(u, { usr, pwd }, (err, resp) => {
        if(err) {
          log("err/login", err)
          alert("Login failed")
          name.focus()
          return
        }
        if(invalid_1(resp)) {
          log("err/login/resp/invalid", resp)
          alert("Login failed")
          name.focus()
          return
        }
        log("login/done", { id:ui.id, usr })
        window.set.ui(resp)
        store.event("ui/set", resp)
      })
    })
  }

  function invalid_1(resp) {
    return !resp || !resp.authKey
  }
}


function dappURL(u) {
  u = u.trim()
  if(!u.startsWith("http")) {
    if(u[0] == "/") u = "http:/" + u
    else u = "http://" + u
  }
  if(!u.endsWith("/")) u += "/"
  return u + "dapp/v2"
}

module.exports = {
  show
}
