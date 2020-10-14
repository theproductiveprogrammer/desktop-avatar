'use strict'
const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld("show", {
  settings: () => ipcRenderer.invoke("show-settings"),
})
contextBridge.exposeInMainWorld("get", {
  logname : () => ipcRenderer.invoke("get-logname"),
  taskname: act => ipcRenderer.invoke("get-taskname", act),
  taskdesc: t => ipcRenderer.invoke("get-taskdesc", t),
  plugins: url => ipcRenderer.invoke("get-plugins", url),
})
contextBridge.exposeInMainWorld("do", {
  task: t => ipcRenderer.invoke("do-task", t),
})
