'use strict'
const { ipcRenderer, contextBridge } = require('electron')

/*    understand/
 * Bridge between the renderer and the main process
 */

contextBridge.exposeInMainWorld("get", {
  logname : () => ipcRenderer.invoke("get-logname")
})

contextBridge.exposeInMainWorld("thisWin", {
  close : () => ipcRenderer.invoke("close-settings")
})
