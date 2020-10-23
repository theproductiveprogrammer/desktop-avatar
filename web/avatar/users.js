'use strict'
const req = require('@tpp/req')

const chat = require('./chat.js')

/*    understand/
 * get a list of users information for whom this app
 * is going to do work for
 */
function getUsers({vars,log,store}, cb) {
  log("avatar/gettingusers")
  let p = `${vars.serverURL}/dapp/v2/myusers`
  let ui = store.get("ui")

  req.post(p, {
    id: ui.id,
    seed: ui.seed,
    authKey: ui.authKey
  }, (err, resp) => {
    if(err || !resp || !resp.body) {
      log("err/avatar/gettingusers", err)
      cb(chat.exit("Error getting users"))
    } else {
      let users = resp.body
      log("avatar/gotusers", { num: users.length })
      log.trace("avatar/gotusers", users)
      store.event("users/set", users)
      cb({
        from: -1,
        chat: chat.manageUsers(users),
      })
    }
  })
}

module.exports = {
  get: getUsers,
}
