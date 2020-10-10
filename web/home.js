'use strict'
const { h } = require('@tpp/htm-x')

const kc = require('../kafclient.js')
const dh = require('../display-helpers.js')

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
    kc.get(log.getName(), msgs => {
      msgs.forEach(msg => {
        let m = msg_1(msg)
        if(m) msglist.push(msg)
        show_msglist_1(cont)
      })
    }, (err, end) => {
      if(err) console.error(err)
      if(end) return 5 * 1000
      return 500
    })

    return cont
  }

  let showing_msglist
  function show_msglist_1(cont) {
    if(showing_msglist) return
    showing_msglist = true

    let users
    show_first_1()

    function show_first_1() {
      if(msglist.length == 0) {
        showing_msglist = false
        if(users) show_report_1(users, reportpane)
      } else {
        let msg = msglist.shift()
        if(msg.users) users = msg.users
        cont.add(msg_1(msg))
        cont.scrollTop = cont.scrollHeight;
        let delay = Math.random() * 2 * 1000 + 1000
        setTimeout(() => show_first_1(), delay)
      }
    }
  }

  function msg_1(msg) {
    if(msg.botsays) return botsays_1(msg)
    if(msg.svrsays) return svrsays_1(msg)
  }
  function botsays_1(msg) {
    let botmsg = h(".botmsg")
    let txt = h(".txt", msg.botsays)
    let icon = h("img.boticon", {
      src: "./bothead.png",
    })
    botmsg.c(icon, txt, h(".clearfix"))
    return botmsg
  }
  function svrsays_1(msg) {
    return h(".svrmsg", msg.svrsays)
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
      onclick: () => alert("TBD")
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
