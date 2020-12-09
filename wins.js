'use strict'
const path = require('path')
const { BrowserWindow, shell } = require('electron')

/*    understand/
 * hold all open windows here - useful to (a) have
 * all windows in one place and (b) ensure they are
 * not garbage collected (this used to be a problem
 * in electron - not sure it is anymore but it doesn't
 * hurt to keep these references)
 */
let wins = {}

/*    way/
 * create the main window and try not to let it be
 * resized (we are not responsive yet). Also the
 * main window has one link on the footer - to
 * the external salesbox website so we don't open that
 * link in the electron browser itself.
 */
function createMainWin() {
  if(wins.main) return wins.main.focus()
  wins.main = new BrowserWindow({
    width: 1300,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload-main.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    backgroundColor: "#0490f9",
  })
  wins.main.setResizable(false)
  wins.main.setMaximizable(false)
  wins.main.setFullScreenable(false)

  wins.main.on("close", () => wins.main = null)

  wins.main.webContents.on("will-navigate", (e, url) => {
    if(url && url.indexOf("src=desktop-avatar") > 0) {
      e.preventDefault()
      shell.openExternal(url)
    }
  })

  loadWin("main.html", wins.main)
}

/*    understand/
 * creates the settings window where users can set their
 * settings
 */
function createSettingsWin() {
  if(wins.settings) return wins.settings.focus()
  wins.settings = new BrowserWindow({
    width: 600,
    height: 700,
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

/*    understand/
 * we need to be able to close the settings window from
 * the render process (when the user clicks the 'submit'
 * button) so we expose this function
 */
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

/*    way/
 * checks that there are no windows open
 */
function None() {
  return BrowserWindow.getAllWindows().length == 0
}

module.exports = {
  Main: createMainWin,
  Settings: createSettingsWin,
  closeSettings,
  None,
}

