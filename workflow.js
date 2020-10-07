'use strict'
const dh = require('./display-helpers.js')
const req = require('./req.js')

function start(store, logger) {
  let userinfo
  store.react("userinfo", ui => {
    if(ui) {
      userinfo = ui
      loggedIn(userinfo, store, logger)
    } else {
      if(userinfo) loggedOut(userinfo, store, logger)
    }
  })
}

function loggedIn(ui, store, logger) {
  logger.botMsg(`${dh.greeting()} <b>${dh.userName(ui)}</b>`)

  store.react("settings.serverURL", serverURL => {
    serverURL = parse_url_1(serverURL)
    if(!serverURL) {
      logger.botMsg(`
I want to connect to the server but the url in "settings" is invalid. Please correct it by clicking the "settings gear" icon on the top left of this page.
`)
      return
    }

    getUsers(serverURL, ui, store, logger)
  })

  function parse_url_1(u) {
    try {
      u = new URL(store.get("settings").serverURL)
      if(u.protocol == "http:" || u.protocol == "https:") {
        return u
      }
    } catch(e) {}
  }
}


function getUsers(serverURL, ui, store, logger) {
  logger.botMsg("I'm asking the server for a list of users")
  let options = {
    protocol: serverURL.protocol,
    host: serverURL.hostname,
    port: serverURL.port,
    path: "/dapp/v2/myusers",
    method: "POST",
  }
  req.send(options, {
    id: ui.id,
    seed: ui.seed,
    authKey: ui.authKey,
  }, (status, err, resp, headers) => {
    if(status != 200 && !err) {
      err = `getUsers: server responded with status: ${status}`
    }
    if(err) {
      logger.err("getUsers failed", err)
      logger.svrMsg(`Error!`)
      logger.botMsg(`
Could not get users from the server. Please check the message log for more details.
`)
    } else {
      logger.svrMsg("Here you go")
      try {
        let users = JSON.parse(resp)
        if(!users || !users.length) {
          logger.botMsg(`
You don't have any other users to manage ${dh.userName(ui)}. Let's work on our own tasks!
`)
          users = [ui]
        } else {
          logger.botMsg(`
We've got ${users.length} users to manage. Let's keep track of them in the report pane on our right.
`)
          users = [ui].concat(users)
        }
        logger.msg({
          t: (new Date()).toISOString(),
          users: users.map(u => u.id),
        })
        store.event("set/users", users)

      } catch(e) {
        console.log(resp.toString())
        logger.err("getUsers response error", e)
        logger.botMsg(`The server's response did not make sense to me. Please check the message log for more details`)
      }
    }
  })
}

function loggedOut(ui, store, logger) {
  logger.botMsg(`${dh.userName(ui)} logged Out`)
}

module.exports = {
  start,
}
