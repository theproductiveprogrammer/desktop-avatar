'use strict'
const { app, dialog, Menu, ipcMain } = require('electron')
const util = require('util')

const db = require('./db.js')
const kc = require('./kafclient.js')
const lg = require('./logger.js')
const wins = require('./wins.js')
const plugins = require('./plugins.js')

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

function setupIPC(log) {
  ipcMain.handle("show-settings", () => {
    wins.Settings()
  })

  ipcMain.handle("close-settings", () => {
    wins.closeSettings()
  })

  ipcMain.handle("get-logname", async () => {
    return { name: log.getName(), DEBUG: process.env.DEBUG }
  })

  ipcMain.handle("get-taskname", async (e,action) => {
    const pluginInfo = util.promisify(plugins.getInfo)
    let loc = require('./loc.js')
    let path = require('path')
    let p = path.join(loc.plugin(), "desktop-avatar-plugins")
    return pluginInfo(p, action)
  })
}

/*    way/
 * Set up the main menu, load the main window when user clicks the app
 * and start by showing the main window
 */
function setupUI() {
  setupMenu()

  app.on("activate", () => {
    if(wins.None()) wins.Main()
  })

  wins.Main()
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
          click: () => wins.Settings()
        }
      ]
    },
    { role: 'windowMenu' },
  ]
  let menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
