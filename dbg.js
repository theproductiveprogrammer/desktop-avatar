'use strict'
const { dialog } = require('electron')
const archiver = require('archiver')
const fs = require('fs')
const path = require('path')

const users = require('./users.js')
const loc = require('./loc.js')

function xport(log) {
  const t = (new Date()).toISOString()
  const n = `troubleshooting-desktop-app-${t}.zip`
  dialog.showSaveDialog({
    title: "Troubleshooting files",
    defaultPath: n,
    buttonLabel: "Export",
  })
  .then(f => {
    if(!f.filePath) return
    const o = fs.createWriteStream(f.filePath)
    const zip = archiver('zip')

    zip.on("warning", w => console.log(w))
    zip.on("error", err => console.error(err))
    zip.pipe(o)

    const logfile = path.join(loc.db(), log.getName())
    zip.file(logfile, { name: log.getName() })
    const userinfo = users.info()
    zip.append(JSON.stringify(userinfo, null, 2), {
      name: "userinfo.json",
    })
    userinfo.forEach(ui => {
      const n = "User-" + ui.id
      const userlog = path.join(loc.db(), n)
      zip.file(userlog, { name: n })
    })
    zip.directory(loc.db(), "all")

    zip.finalize()
  })
  .catch(e => console.error(e))
}

module.exports = {
  xport,
}
