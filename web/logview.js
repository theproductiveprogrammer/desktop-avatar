'use strict'
const { h } = require('@tpp/htm-x')

import "./logview.scss"

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

  store.react("logviewOpen", open => {
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

const isErr = m => m.startsWith("err") || m.startsWith("trace/err")

module.exports = {
  e
}
