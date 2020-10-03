'use strict'
const { app, BrowserWindow, dialog } = require('electron')
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
      createWindow()
      app.on("activate", () => {
        if(BrowserWindow.getAllWindows().length == 0) createWindow()
      })
    }
  })
})

app.on('window-all-closed', () => {
  if(process.platform != "darwin") app.quit()
})
