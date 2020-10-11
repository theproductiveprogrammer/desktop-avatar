'use strict'
const { h } = require('@tpp/htm-x')

const dh = require('./display-helpers.js')

import "./home.scss"

function e(ui, log, store) {
  let page = h('.page')

  let header = h('.header')
  let reportpane = h('.reportpane')

  page.c(
    header,
    user_pane_1(),
    msg_pane_1(),
    reportpane
  )

  return page

  let msglist = []

  function msg_pane_1() {
    let cont = h('.msgpane')

    let shown = 0
    store.react('msgs', msgs => {
      for(let i = shown;i < msgs.length;i++) {
        let msg = msg_1(msgs[i])
        if(msg) cont.add(msg)
      }
      shown = msgs.length
    })
    return cont
  }

  function msg_1(msg) {
    let r = h(".botmsg")
    let txt = h(".txt", msg.txt)
    let icon = h("img.boticon", {
      src: "./bothead.png",
    })
    r.c(icon, txt, h(".clearfix"))
    return r
  }

  function show_report_1(users, cont) {
    cont.innerHTML = ""
    ipcRenderer.invoke("get-users").then(uis => {
      uis.map(ui => cont.add(user_table_1(ui)))
    })
  }

  function user_table_1(ui) {
    let cont = h(".userreport")

    let name = h(".name", dh.userName(ui))
    let id = h(".id", ui.id)
    let tbl = h("table")
    let hdr = h("tr", [
      h("th", "Task"),
      h("th", "Success"),
      h("th", "Failure"),
    ])

    cont.c(
      name,
      tbl.c(hdr),
      id
    )

    return cont
  }


  function user_pane_1() {
    let cont = h('.userpane')
    let icon = h('.usericon', dh.userName(ui)[0])
    let name = h('.name', dh.userName(ui))
    let tenant = h('.tenant', ui.tenant)
    let email = h('.email', ui.email)
    let linkedin = h('.linkedin', ui.linkedin)

    let logout = h('.logout', {
      onclick: () => {
        page.classList.add("bye")
        setTimeout(() => store.event("ui/set"), 350)
      }
    }, "Logout")


    cont.c(icon, name, tenant,
      h(".clearfix"),
      email, linkedin,
      logout
    )

    return cont
  }

}

module.exports = {
  e
}
