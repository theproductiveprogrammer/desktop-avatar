'use strict'
const {app,BrowserWindow,dialog,Menu,ipcMain}=require('electron')
const path = require('path')

const db = require('./db.js')
const logger = require('./logger.js')
const settings = require('./settings.js')

ipcMain.handle("show-settings", () => {
  createSettingsWin()
})

ipcMain.handle("get-logname", async () => {
  return logger.name()
})

ipcMain.handle("get-settings", async () => {
  return settings.get()
})

let userinfo
ipcMain.handle("set-userinfo", async (e, ui) => {
  userinfo = ui
  return userinfo
})

ipcMain.handle("get-userinfo", async () => {
  return userinfo
})

let wins = {}

function createMainWin() {
  if(wins.main) return wins.main.focus()
  wins.main = new BrowserWindow({
    width: 1300,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  wins.main.on("close", () => wins.main = null)

  loadWin("main.html", wins.main)
}

app.whenReady().then(() => {
  db.start(logger, err => {
    logger.log(`Logging to ${logger.name()}`)
    settings.start()
    if(err) {
      dialog.showErrorBox("DB", err.toString())
      app.quit()
    } else {
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
