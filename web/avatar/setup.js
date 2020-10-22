'use strict'

function checkServerURL({vars, store, RETURN}) {
  let serverURL = store.get("settings.serverURL")
  if(serverURL) {
    if(serverURL.endsWith("/")) {
      serverURL = serverURL.substring(0, serverURL.length)
    }
    vars.serverURL = serverURL
    return RETURN
  } else {
    return {
      chat: "I need the server URL to be set so I can connect to the server.\n\nI get all sorts of information from it. Please set the serverURL for me to proceed",
    }
  }
}

function openSettingsWindow() {
  window.show.settings()
  return {}
}

function waitForServerURL(env, cb) {
  let serverURL = env.store.get("settings.serverURL")
  if(serverURL) {
    if(serverURL.endsWith("/")) {
      serverURL = serverURL.substring(0, serverURL.length-2)
    }
    env.vars.serverURL = serverURL
    cb()
  } else {
    setTimeout(() => {
      waitForServerURL(env, cb)
    }, 1000)
  }
}

module.exports = [
  checkServerURL,
  openSettingsWindow,
  waitForServerURL,
  env => env.RETURN,
]
