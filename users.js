'use strict'
const puppeteer = require('puppeteer')

let USERS = {}
let PUPPET_SHOW = false

function setPuppetShow(show) { PUPPET_SHOW = show }

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

function getBrowser(user) {
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


function get(id) {
  let r = USERS[id]
  if(r) r.proxy = UIPS[id]
  return r
}

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
  getBrowser,
  closeBrowsers,
  setPuppetShow,
}
