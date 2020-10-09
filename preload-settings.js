'use strict'
const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld("get", {
  logname : () => ipcRenderer.invoke("get-logname")
})

contextBridge.exposeInMainWorld("thisWin", {
  close : () => ipcRenderer.invoke("close-settings")
})
