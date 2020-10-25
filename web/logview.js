'use strict'
const { h } = require('@tpp/htm-x')

import "./logview.scss"

/*    understand/
 * this pane displays all the log messages and can be
 * closed and opened by the user. If it detects error
 * messages (and the pane is closed) it slides out briefly
 * to alert the user that he may want to take a closer
 * look.
 *
 *    problem/
 * The scrolling is also interesting - we want to scroll
 * to the end of the messages when a new message comes in
 * but if the user is scrolling we don't want to rudely
 * hijack the scroll and yank him all the way down.
 *    way/
 * We keep track of when we are scrolling and - if the user
 * is scrolling we don't scroll until at least 30 seconds
 * have passed after he stopped scrolling
 *
 *    problem/
 * when the user refreshes the page, we reload the logs
 * from the beginning so the log view remains correctly
 * populated. However because we briefly slide out the
 * pane to alert the user about error messages - this
 * sliding happens for every old error message as well
 * leading to a constant slide in-out if there are a lot
 * of error messages in the log.
 *    way/
 * we only slide the log viewer out for recent error
 * messages.
 */
function e(log, store) {
  let logview = h('.logview')

  let title = h(".title", "Messages")
  let closebtn = h(".closebtn", {
    onclick: () => store.event("logview/hide")
  }, "X")

  let loglist = h(".logs")

  logview.c(
    title, closebtn, loglist
  )

  let scrolledon = 0
  loglist.attr({
    onscroll: () => scrolledon = Date.now()
  })

  store.react("view.logviewOpen", open => {
    if(open) logview.classList.add("visible")
    else logview.classList.remove("visible")
  })

  let i = 0
  store.react("logs", logs => {
    if(!logs) return
    let now = Date.now()
    let toshow
    for(;i < logs.length;i++) {
      let curr = logs[i]
      let m = msg_1(curr)
      if(!m) continue
      loglist.appendChild(m)
      if((now - (new Date(curr.t)).getTime()) < 12000 &&
          isErr(curr.e)) toshow = true
    }
    if(now - scrolledon > 30 * 1000) {
      let old = scrolledon
      loglist.scrollTop = loglist.scrollHeight;
      setTimeout(() => scrolledon = old, 200)
    }
    if(toshow) {
      let cl = logview.classList
      if(!cl.contains("visible")) {
        cl.add("visible")
        setTimeout(() => cl.remove("visible"), 1000)
      }
    }
  })

  return logview

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
    let msg = m.e || ""
    let errcls = ""
    if(isErr(msg)) errcls = ".err"
    let data = m.data || ""
    if(data && typeof data == "object") data = JSON.stringify(data, 0, 2)
    data = data ? h('.padded', data) : ""
    return h(".log").c(
      h(".date", dt), h(".time", tm),
      h(`.msg${errcls}`, msg), h(`.data${errcls}`, data)
    )
  }

  function p2(v) {
    if(v < 10) return "0"+v;
    return v
  }
}

/*    way/
 * checks if this is an error message so we can color
 * it RED and alert the user if needed
 */
const isErr = m => m.startsWith("err") || m.startsWith("trace/err")

module.exports = {
  e
}
