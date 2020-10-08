'use strict'
const path = require('path')
const util = require('./util.js')

/*    outcome/
 * Return the base location of our application - where we can store
 * configuration files, data etc
 */
function home() {
  if(process.env.DESKTOP_AVATAR_HOME) return process.env.DESKTOP_AVATAR_HOME

  let root = process.env.APPDATA
  if(root) {
    root = path.join(root, "Local")
  } else {
    root = process.env.HOME
  }
  return path.join(root, "desktop-avatar")
}

/*    outcome/
 * Return the location of the database directory
 */
function db() {
  return path.join(home(), 'db')
}

/*    outcome/
 * Return the location of the plugin directory
 */
function plugin() {
  return path.join(home(), 'plugins')
}

/*    outcome/
 * Return the location of a user's cookie file
 */
function cookieFile(name) {
  let fname = util.sanitizeFilename(`cookies-${name}.json`)
  return path.join(home(), fname)
}

/*    outcome/
 * Return the location of a dumpfile for errors.
 */
function dmp() {
  let t = (new Date()).toISOString()
  return path.join(home(), `dmp-${t}.html`)
}

module.exports = {
  home,
  db,
  plugin,
  cookieFile,
  dmp,
}
