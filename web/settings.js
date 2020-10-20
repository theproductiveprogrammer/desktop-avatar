'use strict'
const { h } = require('@tpp/htm-x')

const kc = require('../kafclient.js')
const lg = require('../logger.js')

import "./settings.scss"

const NAME = "settings"

/*    understand/
 * Main entry point
 */
function main() {
  window.get.logname().then(({name,DEBUG}) => {
    let log = lg(name, DEBUG)
    log.trace("settings/load")
    loadSettings(log, (err, settings) => {
      if(err) log("err/settings/load", err)
      else show(settings, log)
    })
  })
}

function loadSettings(log, cb) {
  let settings = {}
  kc.get(NAME, latest => {
    settings = latest[latest.length-1]
  }, (err, end) => {
    if(err) {
      cb(err)
      return 0
    }
    if(end) {
      cb(null, settings)
      return 0
    }
    return 10
  })
}

function show(settings, log) {
  let cont = document.getElementById("cont")
  cont.innerHTML = ""

  let title = h(".title", "Settings")
  cont.appendChild(title)

  let form = h(".form")
  cont.appendChild(form)

  let svr = h("input.svr", {
    placeholder: "https://app3.salesbox.ai",
    value: settings.serverURL || "",
  })

  let plugins = h("input.plugins", {
    placeholder: "https://bitbucket.org/sbox_charles/dapp-plugins/",
    value: settings.plugins || "",
  })

  let userips = h("textarea.userips", {
    placeholder: "userid = socks proxy port\n\nEg:1234 = 8746",
    onblur: () => userips.value=user_ip_vals_1(user_ips_1())
  }, user_ip_vals_1(settings.userips))

  let chkbox = h("input", { type: "checkbox" })
  let puppetShow = h(".puppetShow", [
    chkbox,
    h("label", "Show Browser Windows"),
  ])
  if(settings.puppetShow) chkbox.attr({ checked : true })

  let submit = h(".submit", {
    tabindex: 0,
    onclick: submit_1,
    onkeydown: e => {

      if(e.keyCode == 13
        || e.key == "Enter"
        || e.code == "Enter") {
        e.preventDefault()
        submit_1()
      }
      if(e.keyCode == 32
        || e.key == "Space"
        || e.code == "Space") {
        e.preventDefault()
        submit_1()
      }

    },
  }, "Submit")

  form.c(
    h(".label", "Server URL"),
    svr,
    h(".label", "Plugins URL"),
    plugins,
    h(".label", "User IP Mapping"),
    userips,
    puppetShow,
    submit
  )

  function user_ip_vals_1(uips) {
    if(!uips) return ""
    return uips.map(v => v.join(" = ")).join("\n")
  }

  function user_ips_1() {
    let v = userips.value
    if(!v) return []
    return v.split(/[\r\n]/).map(v => v.split('=').map(v => parseInt(v))).filter(v => v.length == 2 && !isNaN(v[0]) && !isNaN(v[1]))
  }

  function submit_1() {
    let svrURL = svr.value
    let pluginURL = plugins.value
    if(svrURL && !valid_1(svrURL)) {
      alert("Invalid server URL")
      svr.focus()
      return
    }
    if(pluginURL && !valid_1(pluginURL)) {
      alert("Invalid pluginURL URL")
      plugins.focus()
      return
    }
    settings.t = (new Date()).toISOString()
    settings.serverURL = svrURL
    settings.pluginURL = pluginURL
    settings.userips = user_ips_1()
    settings.puppetShow = chkbox.checked ? true : false
    log.trace("settings/saving", settings)
    kc.put(settings, NAME)
    setTimeout(() => window.thisWin.close(), 2 * 1000)
  }

  function valid_1(u) {
    try {
      u = new URL(u)
      return u.protocol == "http:" || u.protocol == "https:"
    } catch(e) {
      return false
    }
  }

}

main()
