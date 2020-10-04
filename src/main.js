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
      messages.appendChild(h(".msg", JSON.stringify(msg)))
    })
  }, (err, end) => {
    if(err) console.error(err)
    if(end) return 5 * 1000
    return 500
  })


  return messages
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

  let submit = h(".submit", "Login")

  form.c(
    title,
    inputs.c( name, pw ),
    submit
  )

}


main()
