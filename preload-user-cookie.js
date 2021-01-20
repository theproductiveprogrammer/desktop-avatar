'use strict'
const { ipcRenderer, contextBridge } = require('electron')

/*    understand/
 * Bridge between the renderer and the main process
 */

contextBridge.exposeInMainWorld("save", {
  usercookie: info => ipcRenderer.invoke('save-usercookie',info)
})

