'use strict'
const path = require('path')

const {
  app,
  BrowserWindow,
  dialog,
  Menu,
  ipcMain
} = require('electron')

const db = require('./db.js')
const kc = require('./kafclient.js')
const lg = require('./logger.js')
const store = require('./store.js')

const workflow = require('./workflow.js')

/*    understand/
 * main entry point into our program - called
 * when electron is ready
 */
function onReady() {
  const log = lg(generateName(), process.env.DEBUG)

  db.start(log, err => {
    if(err) {
      dialog.showErrorBox("DB", err.toString())
      app.quit()
    } else {
      log("app/info", `Logging to ${log.getName()}`)

      setupIPC(log)
      setupUI()
      setupPolling(store)

      workflow.start(store, log)
    }
  })
}

app.whenReady().then(onReady)

app.on('window-all-closed', () => {
  if(process.platform != "darwin") app.quit()
})


/*    understand/
 * We need a logfile to hold the messages of our current
 * run without interfering with other concurrent runs
 */
function generateName() {
  let n = `log-${(new Date()).toISOString()}-${process.pid}`
  return n.replace(/[/:\\*&^%$#@!()]/g, "_")
}

function setupPolling(store) {
  kc.get("settings", latest => {
    store.event("set/settings", latest[latest.length-1])
  }, (err, end) => {
    if(err) console.error(err)
    if(end) return 5 * 1000
    return 500
  })
}

function setupIPC(log) {
  ipcMain.handle("show-settings", () => {
    createSettingsWin()
  })

  ipcMain.handle("get-logname", async () => {
    return log.getName()
  })

  ipcMain.handle("get-settings", async () => {
    return store.get("settings")
  })

  ipcMain.handle("set-userinfo", async (e, ui) => {
    store.event("set/userinfo", ui)
    return store.get("userinfo")
  })

  ipcMain.handle("get-userinfo", async () => {
    return store.get("userinfo")
  })

  ipcMain.handle("get-users", async () => {
    return store.get("users")
  })
}

/*    way/
 * Set up the main menu, load the main window when user clicks the app
 * and start by showing the main window
 */
function setupUI() {
  setupMenu()

  app.on("activate", () => {
    if(BrowserWindow.getAllWindows().length == 0) createMainWin()
  })

  createMainWin()
}

/*    way/
 * create a template containing most of the default menu items along
 * with our items then set it as our application menu
 */
function setupMenu() {
  let template = [
    { role: 'appMenu' },
    { role: 'fileMenu' },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Settings',
          click: () => createSettingsWin()
        }
      ]
    },
    { role: 'windowMenu' },
  ]
  let menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}


let wins = {}

function createMainWin() {
  if(wins.main) return wins.main.focus()
  wins.main = new BrowserWindow({
    width: 1300,
    height: 800,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload-main.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    backgroundColor: "#0490f9",
  })

  wins.main.on("close", () => wins.main = null)

  loadWin("main.html", wins.main)
}

function createSettingsWin() {
  if(wins.settings) return wins.settings.focus()
  wins.settings = new BrowserWindow({
    width: 600,
    height: 600,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
    },
    backgroundColor: "#0490f9",
  })

  wins.settings.on("close", () => wins.settings = null)

  loadWin("settings.html", wins.settings)
}

/*    problem/
 * In dev mode we want to use the parcel development server so we can
 * have hot-reloading and all that good stuff but for testing/production
 * we want to load the generated files directly.
 *
 *    way/
 * We expect the PARSEL_PORT environment variable to be set and use it to
 * either connect to the parcel development server or to pick up the
 * generated files
 */
function loadWin(name, win) {
  if(process.env.PARCEL_PORT) {
    win.loadURL(`http://localhost:${process.env.PARCEL_PORT}/${name}`)
  } else {
    win.loadFile(`pub/${name}`)
  }
}
