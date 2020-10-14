'use strict'
const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld("show", {
  settings: () => ipcRenderer.invoke("show-settings"),
})
contextBridge.exposeInMainWorld("get", {
  logname : () => ipcRenderer.invoke("get-logname"),
  taskname: action => ipcRenderer.invoke("get-taskname", action),
  plugins: url => ipcRenderer.invoke("get-plugins", url),
})

