'use strict'
const {app,BrowserWindow,dialog,Menu,ipcMain}=require('electron')
const path = require('path')

const db = require('./db.js')

function createMainWin() {
  const win = new BrowserWindow({
    width: 1300,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  loadWin("main.html", win)
}

app.whenReady().then(() => {
  db.start(err => {
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
  const win = new BrowserWindow({
    width: 600,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    },
    backgroundColor: "#0f1627",
  })

  loadWin("settings.html", win)
}

/*    problem/
 * In dev mode we want to use the parcel development server so we can
 * have hot-reloading and all that good stuff but for testing/production
 * we want to load the generated files directly.
 *
 *    way/
 * We expect the PARCEL_DEV environment variable to be set and use it to
 * either connect to the parcel development server or to pick up the
 * generated files
 */
function loadWin(name, win) {
  if(process.env.PARCEL_DEV) {
    win.loadURL(`http://localhost:3000/${name}`)
  } else {
    win.loadFile(`pub/${name}`)
  }
}

ipcMain.handle("show-settings", () => {
  createSettingsWin()
})
