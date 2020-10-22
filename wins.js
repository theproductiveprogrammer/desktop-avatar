'use strict'
const path = require('path')
const { BrowserWindow, shell } = require('electron')

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

  wins.main.webContents.on("will-navigate", (e, url) => {
    if(url && url.indexOf("src=desktop-avatar") > 0) {
      e.preventDefault()
      shell.openExternal(url)
    }
  })

  loadWin("main.html", wins.main)
}

function createSettingsWin() {
  if(wins.settings) return wins.settings.focus()
  wins.settings = new BrowserWindow({
    width: 600,
    height: 660,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload-settings.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    backgroundColor: "#0490f9",
  })

  wins.settings.on("close", () => wins.settings = null)

  loadWin("settings.html", wins.settings)
}

function closeSettings() {
  if(wins.settings) wins.settings.close()
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

function None() {
  return BrowserWindow.getAllWindows().length == 0
}

module.exports = {
  Main: createMainWin,
  Settings: createSettingsWin,
  closeSettings,
  None,
}

