'use strict'
const req = require('@tpp/req')

function getUsers({vars,log,store}, cb) {
  log("avatar/gettingusers")
  let p = `${vars.serverURL}/dapp/v2/myusers`
  let ui = store.get("ui")

  req.post(p, {
    id: ui.id,
    seed: ui.seed,
    authKey: ui.authKey
  }, (err, resp) => {
    if(err) {
      log("err/avatar/gettingusers", err)
      cb({
        chat: "**Error getting users**!\n\nI will notify the developers of this issue. In the meantime you can check the message logs and see if that gives you any ideas.",
        proc: "exit"
      })
    } else {
      let users = resp.body
      log("avatar/gotusers", { num: users.length })
      log.trace("avatar/gotusers", users)
      store.event("users/set", users)
      cb({
        from: -1,
        chat: `You have ${users.length} user(s) to manage`
      })
    }
  })
}

module.exports = {
  get: getUsers,
}
