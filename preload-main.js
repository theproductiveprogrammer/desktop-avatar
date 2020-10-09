'use strict'
const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld("show", {
  settings: () => ipcRenderer.invoke("show-settings"),
})
contextBridge.exposeInMainWorld("set", {
  ui : info => ipcRenderer.invoke("set-userinfo", info),
})
contextBridge.exposeInMainWorld("get", {
  logname : () => ipcRenderer.invoke("get-logname"),
  settings : () => ipcRenderer.invoke("get-settings"),
})

