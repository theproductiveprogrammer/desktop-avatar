'use strict'
const { ipcRenderer } = window.require('electron')
const { h } = require('@tpp/htm-x')

const db = require('./db.js')

import "./main.scss"

/*    understand/
 * main entry point - it all starts here
 */
function main() {
  let cont = document.getElementById("cont")
  login(cont, userinfo => {
    console.log(userinfo)
  })

  ipcRenderer.invoke("get-logname").then(name => {
    let messages = messagePane(name, cont)
    toolbar(messages, cont)
  })

}

/*    way/
 * draw the message pane and show messages
 */
function messagePane(logname, cont) {
  let messages = h('.messages')
  cont.appendChild(messages)

  let title = h(".title", "Messages")
  let closebtn = h(".btn", {
    onclick: () => messages.classList.remove("visible")
  }, "X")

  messages.c(title, closebtn)

  db.get(logname, msgs => {
    msgs.forEach(msg => {
      messages.appendChild(msg_1(msg))
    })
  }, (err, end) => {
    if(err) console.error(err)
    if(end) return 5 * 1000
    return 500
  })

  return messages

  function msg_1(m) {
    let tm = ""
    let dt = ""
    let t = new Date(m.t)
    if(t) {
      const mons = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ]
      tm = p2(t.getHours()) + ":" + p2(t.getMinutes())
      dt = t.getDate() + "/" + mons[t.getMonth()]
    }
    let msg = m.msg || ""
    let err = m.err || ""
    return h(".log").c(
      h(".time", tm), h(".date", dt),
      h(".msg", msg), h(".err", err)
    )
  }

  function p2(v) {
    if(v < 10) return "0"+v;
    return v
  }
}

/*    way/
 * put a "settings" and "hamburger" button
 */
function toolbar(messages, cont) {
  let tb = h(".toolbar")
  let settings = h("img.settings", {
    src: "./settings.svg",
    onclick: () => ipcRenderer.invoke("show-settings")
  })
  let hamburger = h("img.hamburger", {
    src: "./hamburger.svg",
    onclick: () => messages.classList.add("visible")
  })

  cont.appendChild(tb)
  tb.c(settings, hamburger)

}

/*    way/
 * show the login page in the given container, and - after
 * login, send the details back using the callback.
 */
function login(cont, cb) {
  let form = h(".loginForm")
  cont.innerHTML = ""
  cont.appendChild(form)

  let title = h(".title", "Login")
  let inputs = h(".inputs")
  let name = h("input.name", {
    autofocus: true,
    placeholder: "Email or Username"
  })
  let pw = h("input.name", {
    type: "password",
    placeholder: "Password"
  })

  let submit = h(".submit", {
    tabindex: 0,
    onclick: login_1,
    onkeydown: e => {

      if(e.keyCode == 13
        || e.key == "Enter"
        || e.code == "Enter") {
        e.preventDefault()
        login_1()
      }
      if(e.keyCode == 32
        || e.key == "Space"
        || e.code == "Space") {
        e.preventDefault()
        login_1()
      }

    },
  },"Login")

  form.c(
    title,
    inputs.c( name, pw ),
    submit
  )


  function login_1() {
    ipcRenderer.invoke("get-settings").then(settings => {
      if(!settings || !settings.serverURL) {
        alert("Please set the server URL in settings")
        ipcRenderer.invoke("show-settings")
        return
      }
      let n = name.value
      let p = pw.value
      if(!n) {
        name.focus()
        return
      }
      if(!p) {
        pw.focus()
        return
      }
    })
  }

}



main()
