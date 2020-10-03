'use strict'
const kaf = require('kafjs')
const loc = require('./loc.js')
const util = require('./util.js')

/*    way/
 * ensure that the database directory exists then start the kaf db
 */
function start(cb) {
  util.ensureExists(loc.db(), err => {
    if(err) cb(err)
    else startKaf(cb)
  })
}

/*    problem/
 * We support multiple instances of the desktop avatar. At the same
 * time, we don't want them stomping over each other's data.
 *
 *    way/
 * Each avatar attempts to start up a database (actually an event store)
 * on a standard port. If it succeeds, it serves the rest of the
 * instances (including itself). If it fails, it goes to sleep and tries
 * again after sometime - just in case the existing instance is shut
 * down.
 */
function startKaf(cb) {
  const PORT = 7749
  kaf.startServer(PORT, loc.db(), err => {
    if(err) {
      if(err.code === "EADDRINUSE") {
        setTimeout(start, 5 * 1000)
        cb()
      }
      else {
        if(cb) cb(err)
        else console.error(err)
      }
    } else {
      cb && cb()
    }
  })
}

module.exports = {
  start
}
