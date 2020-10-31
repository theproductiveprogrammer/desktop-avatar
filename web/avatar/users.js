'use strict'
const req = require('@tpp/req')

const kc = require('../../kafclient.js')

const chat = require('./chat.js')

/*    understand/
 * get a list of users information for whom this app
 * is going to do work for
 */
function getUsers({vars,log,store}, cb) {
  log("avatar/gettingusers")
  let p = `${vars.serverURL}/dapp/v2/myusers`
  let ui = store.get("user.ui")

  req.post(p, {
    id: ui.id,
    seed: ui.seed,
    authKey: ui.authKey
  }, (err, resp) => {
    if(err || !resp || !resp.body) {
      log("err/avatar/gettingusers", err)
      cb({
        chat: chat.errGettingUsers(),
        call: "exit"
      })
    } else {
      let users = resp.body
      log("avatar/gotusers", { num: users.length })
      log.trace("avatar/gotusers", users)
      store.event("users/set", users)
      setupFroms(store.getUsers(), log, err => {
        if(err) {
          log("err/avatar/setupFroms", err)
          cb({
            chat: chat.errSettingFroms(),
            call: "exit"
          })
        } else {
          cb({
            from: -1,
            chat: chat.manageUsers(users),
          })
        }
      })
    }
  })
}

let froms = {}
function setupFroms(users, log, cb) {
  if(!users) return cb()
  setup_ndx_1(0)

  function setup_ndx_1(ndx) {
    if(ndx >= users.length) return cb()
    const user = users[ndx]
    const name = `User-${user.id}`
    log.trace("setupFroms/getting", { name })
    kc.get(name, () => 1, (err, end, from) => {
      if(err) return cb(err)
      if(!end) return 10
      if(!from) return cb(`Invalid from: ${from}`)
      from += 1
      log.trace("setupFroms/got", { from })
      froms[user.id] = from
      setup_ndx_1(ndx+1)
    })
  }
}

function talkShop({store, say}, cb) {


  function lazying_1() {
    //const TALK_WITH_USER_EVERY = 5 * 60 * 1000
    const TALK_WITH_USER_EVERY = 5 * 1000 //TODO: remove
    let last = store.get("time.lastLazy")
    if(!last) last = 0
    if(Date.now() - last < TALK_WITH_USER_EVERY) return cb()
    cb(`Nothing to do...${dh.anEmoji("sleepy")}`)
  }
}

module.exports = {
  get: getUsers,
}
