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
  let worktable = h(".worktable")
  let workreports = h(".workreports").c(
    h(".title", [
      "Work Report Details",
      h(".close", {
        onclick: () => workreports.classList.remove("visible"),
      }, "X")
    ]),
    worktable
  )
  let reportpane = h('.reportpane').c(
    h('.title', [
      "Work Reports ",
      h("span.open", {
        onclick: () => workreports.classList.add("visible"),
      }, "Open")
    ]),
    reports
  )

  page.c(
    header.c(
      h("img", { src: "./salesboxai-logo.png" })
    ),
    user_pane_1(),
    avatar_pane_1(),
    reportpane,
    workreports,
  )

  let ustore
  store.react("user.ui", show_users_1)
  store.react("user.users", show_users_1)
  let wstore
  store.react("user.tasks", load_work_table_1)
  store.react("user.status", load_work_table_1)

  return page

  function load_work_table_1() {
    if(wstore) wstore.destroy()
    wstore = store.ffork()
  }

  function show_users_1() {
    if(ustore) ustore.destroy()
    ustore = store.ffork()
    const users = store.getUsers()
    reports.c()
    reports.add(users.map(ui => user_table_1(ui, ustore)))
  }

  function user_table_1(ui, store) {
    let cont = h(".userreport")

    let name = h(".name", dh.userName(ui))
    let id = h(".id", ui.id)
    let tbl = h("table")
    let hdr = h("tr", [
      h("th", "Task"),
      h("th", "Assigned"),
      h("th", "In Progress"),
      h("th", "Success"),
      h("th", "Failure"),
    ])

    cont.c(
      name,
      tbl.c(hdr),
      id
    )

    store.react("user.status", show_status_1)
    store.react("user.tasks", show_status_1)

    return cont

    function show_status_1() {
      tbl.c(hdr)
      const tasks = store.getTasks(ui.id)
      let summary = {}
      for(let i = 0;i < tasks.length;i++) {
        let curr = tasks[i].action
        if(!summary[curr]) summary[curr] = {
          assigned: 1,
          inprogress: 0,
          success: 0,
          failure: 0
        }
        else summary[curr].assigned++
        let status = status_1(tasks[i])
        if(status) summary[curr][status]++
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
          h("td", summary[action].inprogress),
          h("td", summary[action].success),
          h("td", summary[action].failure),
        ]))
      }
    }
  }

  function status_1(task) {
    const status = store.getTaskStatus(task.id)
    if(!status) return
    if(status.code == 102) return "inprogress"
    if(status.code == 200) return "success"
    if(status.err) return "failure"
  }


  /*    way/
   * show the avatar pane and react to new messages. If we
   * find that messages have reduced/cleared, restart from
   * scratch as that's our expected case (logged out and
   * re-logged in).
   *
   *    problem/
   * we need to scroll to show the latest message to the
   * user. However, the user may have himself scrolled up
   * to look at earlier messages and we don't want to rudely
   * drag him down again.
   *
   *    way/
   * keep track of the last time the user scrolled manually
   * and don't do anything for at least 15 seconds after
   * that. Otherwise scroll down for each new message.
   */
  function avatar_pane_1() {
    let cont = h('.msgpane')
    let msgblock = h('.msgblock')

    cont.c(
      h('.title', dh.greeting(ui)),
      h('.subtitle', "Let's get started!"),
      msgblock
    )

    let scrolledon = 0
    let autoscroll = false
    msgblock.attr({
      onscroll: () => autoscroll||(scrolledon = Date.now())
    })

    let shown = 0
    store.react('user.msgs', msgs => {
      if(!msgs) return
      if(shown > msgs.length) {
        msgblock.c()
        shown = 0
      }
      let scroll = false
      for(let i = shown;i < msgs.length;i++) {
        let msg = msg_1(msgs[i])
        if(msg) {
          msgblock.add(msg)
          scroll = true
        }
      }
      shown = msgs.length
      if(!scroll) return
      let now = Date.now()
      if(now - scrolledon > 15 * 1000) {
        autoscroll = true
        msgblock.scrollTop = msgblock.scrollHeight
        setTimeout(() => autoscroll = false, 200)
      }
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

    store.react("time.now", n => {
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
        setTimeout(() => window.x.it(), 350)
      }
    }, "Exit")


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
