'use strict'
const chat = require('./chat.js')

/*    understand/
 * if we have a server URL to connect to RETURN from this
 * sub-procedure otherwise let it proceed to do other
 * things (bring up the settings window / set a default)
 */
function checkServerURL({vars, store, RETURN, say}, cb) {
  let serverURL = store.get("settings.serverURL")
  if(!serverURL) return {}
  if(serverURL.endsWith("/")) {
    serverURL = serverURL.substring(0, serverURL.length)
  }
  vars.serverURL = serverURL
  return RETURN
}

/*    way/
 * ask the main process to bring up the settings window
 */
function openSettingsWindow() {
  window.show.settings()
  return {}
}

/*    way/
 * periodically check if the user has provided us with
 * a serverURL (this will be pulled in as we poll the
 * settings logfile)
 */
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

const DEFAULT_PLUGIN_URL="https://github.com/theproductiveprogrammer/desktop-avatar-plugins.git"
/*    way/
 * request the main process to download and setup the
 * plugins that perform our tasks for us
 */
function getPlugins({store, log}, cb) {
  let pluginURL = store.get("settings.pluginURL")
  if(!pluginURL) pluginURL = DEFAULT_PLUGIN_URL
  window.get.plugins(pluginURL)
    .then(() => cb({}))
    .catch(err => {
      log("err/getPlugins", err)
      cb({
        chat: "**Error downloading plugins**!\n\nI will notify the developers of this issue. In the meantime you can check the message logs and see if that gives you any ideas.",
        proc: "exit"
      })
    })
}

module.exports = {
  checkServerURL,
  openSettingsWindow,
  waitForServerURL,
  getPlugins,
}
