'use strict'

/*    way/
 * randomly sleep for a while to avoid overwhelming the
 * server
 */
function takeANap(env, cb) {
  let delay = Math.random() * 20000 + 1000
  setTimeout(() => cb(), delay)
}

module.exports = {
  takeANap,
}
