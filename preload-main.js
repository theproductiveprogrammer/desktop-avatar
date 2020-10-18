'use strict'
const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld("show", {
  settings: () => ipcRenderer.invoke("show-settings"),
})
contextBridge.exposeInMainWorld("get", {
  logname : () => ipcRenderer.invoke("get-logname"),
  taskname: act => ipcRenderer.invoke("get-taskname", act),
  taskchat: t => ipcRenderer.invoke("get-taskchat", t),
  plugins: url => ipcRenderer.invoke("get-plugins", url),
})
contextBridge.exposeInMainWorld("set", {
  users: uis => ipcRenderer.invoke("set-users", uis),
  usermap: umap => ipcRenderer.invoke("set-usermap", umap),
})
contextBridge.exposeInMainWorld("do", {
  task: t => ipcRenderer.invoke("do-task", t),
})
