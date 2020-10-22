'use strict'
const { h } = require('@tpp/htm-x')

const dh = require('./display-helpers.js')

import "./home.scss"

/*    understand/
 * the home page shows a user pane on the left, a report
 * pane on the right and the middle contains a view of
 * the avatar that is doing work chatting with you
 */
function e(ui, log, store) {
  let page = h('.page')

  let header = h('.header')
  let reports = h(".reports")
  let reportpane = h('.reportpane').c(
    h('.title', "Work Reports"),
    reports
  )

  page.c(
    header.c(
      h("img", { src: "./salesboxai-logo.png" })
    ),
    user_pane_1(),
    avatar_pane_1(),
    reportpane
  )

  let ustore
  store.react("users", uis => {
    if(ustore) ustore.destroy()
    ustore = store.fork()
    reports.c(user_table_1(ui, ustore))
    if(!uis) return
    uis.forEach(ui => reports.add(user_table_1(ui, ustore)))
  })

  return page

  function user_table_1(ui, store) {
    let cont = h(".userreport")

    let name = h(".name", dh.userName(ui))
    let id = h(".id", ui.id)
    let tbl = h("table")
    let hdr = h("tr", [
      h("th", "Task"),
      h("th", "Assigned"),
      h("th", "Success"),
      h("th", "Failure"),
    ])

    cont.c(
      name,
      tbl.c(hdr),
      id
    )

    store.react("tasks", tasks => {
      tbl.c(hdr)
      if(!tasks) return
      tasks = tasks.filter(t => t.userId == ui.id)
      let summary = {}
      for(let i = 0;i < tasks.length;i++) {
        let curr = tasks[i].action
        if(!summary[curr]) summary[curr] = { assigned: 1 }
        else summary[curr].assigned++
      }
      for(let action in summary) {
        let name = h("td", action)
        window.get.taskname(action)
          .then(n => {
            name.innerText = n
          })
          .catch(e => console.error(e))
        tbl.add(h("tr", [
          name,
          h("td", summary[action].assigned),
          h("td", 0),
          h("td", 0)
        ]))
      }
    })

    return cont
  }


  let msglist = []

  function avatar_pane_1() {
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
    let name = h(".name", dh.userName(msg.from))
    let txt = txt_1(msg)
    let src = msg.from.logo || "./default-user-image.png"
    let icon = h("img.boticon", { src })
    let tm = h(".tm")
    r.c(icon, name, tm, txt, h(".clearfix"))

    store.react("now", n => {
      let tm_ = get_tm_1(msg.t, n)
      if(tm) tm.c(tm_)
    })

    return r
  }

  function txt_1(msg) {
    let txt = dh.md(dh.emojify(msg.chat))
    let cls = ".txt"
    if(dh.isJustEmojis(msg.chat)) cls += ".just-emojis"
    return h(cls, txt)
  }

  function get_tm_1(t, n) {
    if(!n) return ""

    let r_1 = (d, v) => {
      d = Math.floor(d)
      if(d != 1) v += "s"
      return `${d} ${v} ago`
    }

    t = new Date(t).getTime()
    let secs = Math.floor((n.getTime() - t)/1000)

    if(secs < 1) return r_1(1, "second")

    let diff = secs / 31536000;
    if(diff > 1) return r_1(diff, "year")

    diff = secs / 2592000;
    if(diff > 1) return r_1(diff, "month")

    diff = secs / 86400;
    if(diff > 1) return r_1(diff, "day")

    diff = secs / 3600;
    if(diff > 1) return r_1(diff, "hour")

    diff = secs / 60;
    if(diff > 1) return r_1(diff, "minute")

    return r_1(secs, "second")
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
    if(ui.pic) return h('img.usericon', { src: ui.pic })
    else return h('.usericon', dh.userName(ui)[0])
  }

}

module.exports = {
  e
}
