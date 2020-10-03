'use strict'
const {app,BrowserWindow,dialog,Menu}=require('electron')
const path = require('path')

const db = require('./db.js')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
    backgroundColor: "#0490f9",
  })

  mainWindow.loadFile("default.html")
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
    if(BrowserWindow.getAllWindows().length == 0) createWindow()
  })

  createWindow()
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
          click: () => settingsWindow()
        }
      ]
    },
    { role: 'windowMenu' },
  ]
  let menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function settingsWindow() {
  const settingsWindow = new BrowserWindow({
    width: 600,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    },
    backgroundColor: "#0f1627",
  })

  if(process.env.PARCEL_WATCH) settingsWindow.loadURL("http://localhost:3000")
  else settingsWindow.loadFile("pub/settings.html")
}
