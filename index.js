'use strict'
const {app,BrowserWindow,dialog,Menu,ipcMain}=require('electron')
const path = require('path')

const db = require('./db.js')
const logger = require('./logger.js')
const settings = require('./settings.js')
const store = require('./store.js')

const workflow = require('./workflow.js')

ipcMain.handle("show-settings", () => {
  createSettingsWin()
})

ipcMain.handle("get-logname", async () => {
  return logger.name()
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

let wins = {}

function createMainWin() {
  if(wins.main) return wins.main.focus()
  wins.main = new BrowserWindow({
    width: 1300,
    height: 800,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  wins.main.on("close", () => wins.main = null)

  loadWin("main.html", wins.main)
}

app.whenReady().then(() => {
  db.start(logger, err => {
    if(err) {
      dialog.showErrorBox("DB", err.toString())
      app.quit()
    } else {
      logger.log(`Logging to ${logger.name()}`)
      settings.start(store)
      workflow.start(store, logger)
      setupUI()
    }
  })
})

app.on('window-all-closed', () => {
  if(process.platform != "darwin") app.quit()
})

/*    way/
 * Set up the main menu, load the main window when user clicks the app
 * and start by showing the main window
 */
function setupUI() {
  setMenu()

  app.on("activate", () => {
    if(BrowserWindow.getAllWindows().length == 0) createMainWin()
  })

  createMainWin()
}

/*    way/
 * create a template containing most of the default menu items along
 * with our items then set it as our application menu
 */
function setMenu() {
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
