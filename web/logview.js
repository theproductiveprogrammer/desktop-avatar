'use strict'
const { h } = require('@tpp/htm-x')

import "./logview.scss"

function e(log, store) {
  let logview = h('.logview')

  let title = h(".title", "Messages")
  let closebtn = h(".btn", {
    onclick: () => store.event("logview/hide")
  }, "X")

  let loglist = h(".logs")

  logview.c(
    title, closebtn, loglist
  )

  store.react("logviewOpen", open => {
    if(open) logview.classList.add("visible")
    else logview.classList.remove("visible")
  })

  let i = 0
  store.react("logs", logs => {
    if(!logs) return
    for(;i < logs.length;i++) {
      let m = msg_1(logs[i])
      if(!m) continue
      loglist.appendChild(m)
      loglist.scrollTop = loglist.scrollHeight;
      if(logs[i].e.startsWith("err/")) {
        let cl = logview.classList
        if(!cl.contains("visible")) {
          cl.add("visible")
          setTimeout(() => cl.remove("visible"), 1000)
        }
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
    if(msg.startsWith("err/")) errcls = ".err"
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

module.exports = {
  e
}
