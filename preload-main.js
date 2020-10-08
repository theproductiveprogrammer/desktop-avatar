'use strict'
const { ipcRenderer, contextBridge } = require('electron')

ipcRenderer.invoke("get-logname").then(name => {
  contextBridge.exposeInMainWorld("logname", { name })
  contextBridge.exposeInMainWorld("show", {
    settings: () => ipcRenderer.invoke("show-settings")
  })
})
