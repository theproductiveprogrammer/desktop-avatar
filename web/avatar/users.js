'use strict'
const req = require('@tpp/req')

const kc = require('../../kafclient.js')
const dh = require('../display-helpers.js')

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
      cb({
        from: -1,
        chat: chat.manageUsers(users),
      })
    }
  })
}

/*    way/
 * get all new statuses and talk about them. If nothing has
 * been done tell the user we're lazing around.
 *
 *    problem/
 * when doing work (see `schedule.work()` function) we insert
 * a dummy 'start' message. This comes before the actual 'start'
 * message. Because both messages are start messages the chat
 * will say "starting xxx" twice
 *
 *    way/
 * if the message has "dummy" in it we will ignore it
 */
let talkedTill
function talkShop({store, say, log}, cb) {
  if(store.get("expectlogs")) return {}

  const status = get_new_1()
  let lazying = true
  if(status && status.length) talk_about_tasks_1(0)
  if(lazying) lazying_1()

  function talk_about_tasks_1(ndx) {
    if(ndx >= status.length) return cb()
    const s = status[ndx]
    if(!s.msg || !s.code) return talk_about_tasks_1(ndx+1)
    if(s.code == 202) return talk_about_tasks_1(ndx+1)
    if(s.msg.indexOf("/dummy") !== -1) return talk_about_tasks_1(ndx+1)
    lazying = false
    store.event("lastLazy/set", Date.now())
    const t = store.getTask(s.id)
    window.get.taskchat(t, s.code)
      .then(msg => {
        say({
          from: store.getTaskUser(t),
          chat: msg,
        }, () => talk_about_tasks_1(ndx+1))
      })
      .catch(err_ => {
        log("err/talkShop", err)
        talk_about_tasks_1(ndx+1)
      })
  }


  /*    way/
   * get the latest status from the last time we got it or
   * start from the new status's (past the ones historically)
   */
  function get_new_1() {
    if(!talkedTill) talkedTill = store.get("hist.status")
    const all = store.get("user.status")
    const status = all.slice(talkedTill)
    talkedTill = all.length
    return status
  }


  function lazying_1() {
    const TALK_WITH_USER_EVERY = 5 * 60 * 1000
    let last = store.get("time.lastLazy")
    if(!last) last = 0
    if(Date.now() - last < TALK_WITH_USER_EVERY) return cb()
    store.event("lastLazy/set", Date.now())
    cb(`Nothing to do...${dh.anEmoji("sleepy")}`)
  }
}

module.exports = {
  get: getUsers,
  talkShop,
}
