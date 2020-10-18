'use strict'

let USERS = {}

function set(uis) {
  let users = USERS
  USERS = {}
  if(uis) {
    uis.forEach(ui => {
      USERS[ui.id] = Object.assign({ ui }, users[ui.id])
    })
  }
}

function get(id) {
  let r = USERS[id]
  if(r) r.proxy = UMAP[id]
  return r
}

let UMAP = {}
function setmap(umap) {
  UMAP = {}
  if(umap) {
    umap.forEach(m => UMAP[m[0]] = m[1])
  }
}

module.exports = {
  set,
  get,
  setmap,
}
