'use strict'
const { h } = require('@tpp/htm-x')

const dh = require('./display-helpers.js')

import "./home.scss"

function e(ui, log, store) {
  let page = h('.page')

  let header = h('.header')
  let reportpane = h('.reportpane').c(
    h('.title', "Work Reports")
  )

  page.c(
    header.c(
      h("img", { src: "./salesboxai-logo.png" })
    ),
    user_pane_1(),
    msg_pane_1(),
    reportpane
  )

  return page

  let msglist = []

  function msg_pane_1() {
    let cont = h('.msgpane')
    let msgblock = h('.msgblock')

    cont.c(
      h('.title', `${dh.greeting()} ${dh.userName(ui)}`),
      h('.subtitle', "Let's get started!"),
      msgblock
    )

    let shown = 0
    store.react('msgs', msgs => {
      for(let i = shown;i < msgs.length;i++) {
        let msg = msg_1(msgs[i])
        if(msg) msgblock.add(msg)
      }
      shown = msgs.length
    })
    return cont
  }

  function msg_1(msg) {
    let r = h(".msg")
    let name = h(".name", dh.userName(ui))
    let txt = h(".txt", msg.txt)
    let src = ui.logo || "./default-user-image.png"
    let icon = h("img.boticon", { src })
    let tm = h(".tm", get_tm_1(msg.t))
    r.c(icon, name, tm, txt, h(".clearfix"))
    return r
  }

  function get_tm_1(t) {
    t = new Date(t).getTime()
    let secs = Math.floor((new Date().getTime() - t)/1000)
    let diff = secs / 31536000;

    if (diff > 1) {
      return Math.floor(diff) + " years ago"
    }

    diff = secs / 2592000;
    if(diff > 1) {
      return Math.floor(diff) + " months ago"
    }
    diff = secs / 86400;
    if(diff > 1) {
      return Math.floor(diff) + " days ago"
    }
    diff = secs / 3600;
    if(diff > 1) {
    return Math.floor(diff) + " hours ago"
    }
    diff = secs / 60;
    if(diff > 1) {
      return Math.floor(diff) + " minutes ago"
    }
    return Math.floor(secs) + " seconds ago"
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
    let icon = icon_1(ui)
    let name = h('.name', dh.userName(ui))
    let tz = h('.tz', dh.timeZone(ui))
    let email = h('.email', ui.email)
    let linkedin = h('.linkedin', ui.linkedin)

    let logout = h('.logout.btn', {
      onclick: () => {
        page.classList.add("bye")
        setTimeout(() => store.event("ui/set"), 350)
      }
    }, "Logout")


    cont.c(icon, name, tz,
      h(".clearfix"),
      email, linkedin,
      logout
    )

    return cont
  }

  function icon_1(ui) {
    return h('.usericon', dh.userName(ui)[0])
    /*
    if(ui.logo) return h('img.usericon', { src: ui.logo})
    else return h('.usericon', dh.userName(ui)[0])*/
  }

}

module.exports = {
  e
}
