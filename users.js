'use strict'
const fs = require('fs').promises
const puppeteer = require('puppeteer')
const loc = require('./loc.js')

/*    understand/
 * keep track of the users and their browsers
 */
let USERS = {}
let PUPPET_SHOW = false

/*    understand/
 * keep unique objects to track errors
 */
const NEEDS_CAPCHA = {}
const LOGIN_ERR = {}
const PREMIUM_ERR = {}

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
 * wise launch a new browser with the (proxy and show) settings
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

    let pexe = puppeteer.executablePath()
    let rx_isasar1 = /\\app.asar\\/
    if(pexe.match(rx_isasar1)) {
      pexe = pexe.replace(rx_isasar1, "\\app.asar.unpacked\\")
    }
    let rx_isasar2 = /\/app.asar\//
    if(pexe.match(rx_isasar2)) {
      pexe = pexe.replace(rx_isasar2, "/app.asar.unpacked/")
    }

    puppeteer.launch({
      headless:!puppetShow,
      executablePath: pexe,
      args
    }).then(browser => {
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
 * launch a browser with the current configuration, login to
 * linkedin, check navigator and cache the result with it's
 * configuration
 * TODO: should this be configurable? - Facebook browser? Reddit browser? Twitter browser? ...
 */
async function linkedInPage(cfg, auth, browser) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })
  page.setCacheEnabled(false)
  if(cfg.timeout) await page.setDefaultTimeout(cfg.timeout)
  if(process.env.DEBUG) {
    page.on("console", msg => console.log(msg.text()))
  }
  const loggedin = await cookie_login_1(page, auth)
  if(!loggedin) {
    await auth_login_1(auth, page)
    await save_login_cookie_1(page, auth)
  }
  //TODO: re-enable this check after QA cycle
  //if(!process.env.DEBUG) await check_premium_enabled_1(page)

  await randomly_scroll_sometimes_1()
  await check_capcha_1()

  return page

  async function randomly_scroll_sometimes_1() {
    const call = Math.floor(Math.random() * 16)
    if(call == 8) await autoScroll(page)
  }

  async function check_capcha_1() {
    try {
      await page.waitForSelector('#rc-anchor-container')
      throw NEEDS_CAPCHA
    } catch(e) {}
  }

  /*    outcome/
   * We check if we have an element (li-icon) with type
   * "premium-wordmark" which would indicate that we have premium
   * enabled. Otherwise we check if we have a li-icon with type
   * "sales-navigator-app-icon" which would indicate we have a Sales
   * Navigator subscription.
   */
  async function check_premium_enabled_1(page) {
    let enabled = await page.evaluate(async () => {
      let elems = document.getElementsByTagName('li-icon')
      for(let i = 0;i < elems.length;i++) {
        let t = elems[i].getAttribute('type')
        if(t == 'premium-wordmark' ||
            t == 'sales-navigator-app-icon') return true
      }
    })
    if(!enabled) throw PREMIUM_ERR
  }

  async function cookie_login_1(page, auth) {
    try {
      let cookie_f = loc.cookieFile(auth.id)
      let cookie_s = await fs.readFile(cookie_f)
      let cookies = JSON.parse(cookie_s)
      await page.setCookie(...cookies)

      await page.goto('https://www.linkedin.com/')
      await page.waitFor('input[role=combobox]')

      return true

    } catch(e) {}

    try {
      await page.waitFor('[data-resource="feed/badge"]')

      return true
    } catch (e) {}

    return false
  }

  async function save_login_cookie_1(page, auth) {
    try {
      let cookie_f = loc.cookieFile(auth.id)
      let cookies = await page.cookies()
      await fs.writeFile(cookie_f, JSON.stringify(cookies))
    } catch(e) {
      console.error(e)
    }
  }

  async function auth_login_1(auth, page) {
    if(!auth.linkedinUsername || !auth.linkedinPassword) throw LOGIN_ERR

    try {
      await page.goto('https://www.linkedin.com/uas/login')

      const user_name = "input#username"
      await page.waitForSelector(user_name)
      await page.type(user_name, auth.linkedinUsername)

      const pass_word = "input#password"
      await page.waitForSelector(pass_word)
      await page.type(pass_word, auth.linkedinPassword)

      const submitButton = "button.btn__primary--large"
      await page.waitForSelector(submitButton)
      await page.click(submitButton)

      await page.waitFor('input[role=combobox]',{timeout:200000})
    } catch(e) {
      throw LOGIN_ERR
    }
  }

}

/*    outcome/
 * Scroll down the page a bit
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0
      let distance = 100
      let maxdistance = 5000 + Math.floor(Math.random() * 10000)
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance
        if(totalHeight >= scrollHeight ||
          totalHeight > maxdistance){
          clearInterval(timer)
          resolve()
        }
      }, 100)
    })
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
  linkedInPage,
  autoScroll,

  NEEDS_CAPCHA,
  LOGIN_ERR,
  PREMIUM_ERR,
}
