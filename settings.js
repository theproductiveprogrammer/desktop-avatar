'use strict'
const db = require('./db.js')

const NAME = "settings"

/*    understand/
 * we periodically get the settings from our saved info
 */
function start(store) {
  db.get(NAME, latest => {
    store.event("set/settings", latest[latest.length-1])
  }, (err, end) => {
    if(err) console.error(err)
    if(end) return 5 * 1000
    return 500
  })
}

function set(settings) {
  settings.t = (new Date()).toISOString()
  db.put(settings, NAME)
}

module.exports = {
  set,
  start,
}
