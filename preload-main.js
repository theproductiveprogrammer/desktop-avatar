'use strict'
const { ipcRenderer, contextBridge } = require('electron')

/*    understand/
 * Bridge between the renderer and the main process
 */

contextBridge.exposeInMainWorld("show", {
  settings: () => ipcRenderer.invoke("show-settings"),
})
contextBridge.exposeInMainWorld("get", {
  logname : () => ipcRenderer.invoke("get-logname"),
  taskname: act => ipcRenderer.invoke("get-taskname", act),
  taskchat: (t,s) => ipcRenderer.invoke("get-taskchat",t,s),
  plugins: url => ipcRenderer.invoke("get-plugins", url),
})
contextBridge.exposeInMainWorld("set", {
  users: uis => ipcRenderer.invoke("set-users", uis),
  userips: uips => ipcRenderer.invoke("set-userips", uips),
  puppetShow: show => ipcRenderer.invoke("set-puppetShow", show),
})
contextBridge.exposeInMainWorld("x", {
  cute: t => ipcRenderer.invoke("x-cute", t),
  it: () => ipcRenderer.invoke("x-it"),
  cute2: t => ipcRenderer.invoke("x-cute-again", t),
})
contextBridge.exposeInMainWorld("add", {
  tasks: t => ipcRenderer.invoke("add-tasks", t),
  sent: tasks => ipcRenderer.invoke("add-sent", tasks),
})
