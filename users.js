'use strict'
const puppeteer = require('puppeteer')

/*    understand/
 * keep track of the users and their browsers
 */
let USERS = {}
let PUPPET_SHOW = false

function setPuppetShow(show) { PUPPET_SHOW = show }

/*    way/
 * Close any existing browsers and link up the ui's (user
 * info's) with the associated users - keeping any
 * additional information we may have cached
 */
function set(uis) {
  closeBrowsers()

  let users = USERS
  USERS = {}
  if(uis) {
    uis.forEach(ui => {
      USERS[ui.id] = Object.assign({ ui }, users[ui.id])
      delete users[ui.id]
    })
  }
}

function closeBrowsers() {
  for(let k in USERS) {
    if(USERS[k].browserCache) {
      USERS[k].browserCache.browser.close()
      delete USERS[k].browserCache
    }
  }
}

/*    way/
 * If there is a valid cached browser return that - other
 * wise create a new browser with the (proxy and show) settings
 * and return that - adding it to the cache for next time.
 */
function browser(user) {
  if(user.browserCache) {
    if(user.browserCache.proxy == user.proxy &&
      user.browserCache.puppetShow == PUPPET_SHOW) {
      return Promise.resolve(user.browserCache.browser)
    }
    user.browserCache.browser.close()
    delete user.browserCache
  }
  let args = []
  if(user.proxy) {
    args.push(`--proxy-server=socks5://localhost:${uctx.proxy}`)
  }
  return new Promise((resolve, reject) => {
    let puppetShow = PUPPET_SHOW
    puppeteer.launch({ headless:!puppetShow, args })
      .then(browser => {
        user.browserCache = {
          proxy: user.proxy,
          puppetShow,
          browser,
        }
        resolve(browser)
      })
      .catch(reject)
  })
}


/*    way/
 * return user information (including associated proxy
 * port)
 */
function get(id) {
  let r = USERS[id]
  if(r) r.proxy = UIPS[id]
  return r
}

/*    understand/
 * holds user to proxy ip mapping
 */
let UIPS = {}
function setips(uips) {
  UIPS = {}
  if(uips) {
    uips.forEach(m => UIPS[m[0]] = m[1])
  }
}



module.exports = {
  set,
  get,
  setips,
  browser,
  setPuppetShow,
}
