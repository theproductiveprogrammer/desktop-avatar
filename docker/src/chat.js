'use strict'
const dh = require('./display-helpers.js')

/*    understand/
 * react to chat messages
 */
function init(store) {
  let shown = 0
  store.react('user.msgs', msgs => {
    if(!msgs || !msgs.length) shown = 0
    else while(shown < msgs.length) chat(msgs[shown++])
  })
}

/*    understand/
 * add some helper messages
 */
const say = {
  foldersFailed: [
    'ERR',
    `Failed to create required data folders ${dh.anEmoji("sad")}`,
  ],

  settingsFailed: [
    'ERR',
    `Failed to load settings - cannot start ${dh.anEmoji("sad")}`,
    `Please create a valid "settings.json" file under "desktop-avatar-docker-db/"`,
    `Something like this:`,
    `
{
  "serverURL": "",
  "timeout": 40000,
  "maxbrowsers": 2,
  "userips": [],
  "userList": ""
}`,
  ],

  loginFailed: [
    'ERR',
    `Login failed ${dh.anEmoji("sad")}`
  ],

  dbFailed: [
    'ERR',
    `Failed to start db! ${dh.anEmoji("surprise")}`,
  ],
}

/*    way/
 * convert the messages to a proper function
 */
for(let k in say) {

  const msgs = Array.isArray(say[k]) ? say[k] : [say[k]]
  say[k] = (err, cb) => say_(cb, err, msgs, 0)

  /*    way/
   * chat each message to the user (converting ERR to show the error)
   */
  function say_(cb, err, msgs, ndx) {
    if(ndx >= msgs.length) {
      if(cb) cb()
      return
    }
    const msg = msgs[ndx]
    if(msg === 'ERR') {
      console.error(err)
      say_(cb, err, msgs, ndx+1)
    } else {
      if(ndx == msgs.length -1) {
        chat(msg)
        say_(cb, err, msgs, ndx+1)
      } else {
        chat(msg, () => say_(cb, err, msgs, ndx+1))
      }
    }
  }
}


/*    way/
 * show the txt (with emoji's) on the user's console,
 * using a slight (random) delay if the user has
 * a callback.
 */
function chat(msg, cb) {
  if(typeof msg === 'string') msg = { chat: msg }
  if(!msg.t) msg.t = (new Date()).toISOString()
  if(!msg.chat) return
  if(typeof msg.chat !== "string") msg.chat = JSON.stringify(msg.chat)

  const txt = dh.emojifyConsole(msg.chat)
  console.log(`${from_1(msg)} (${msg.t}): ${txt}`)
  if(cb) setTimeout(cb, Math.random() * 1000 + 200)

  function from_1(msg) {
    if(!msg.from) return "desktop-avatar"
    const from = msg.from
    if(from.firstName && from.lastName) return `${from.firstName} ${from.lastName}`
    if(from.firstName) return from.firstName
    if(from.lastName) return from.lastName
    return "desktop-avatar"
  }
}

module.exports = {
  init,
  say
}
