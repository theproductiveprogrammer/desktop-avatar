'use strict'
const path = require('path')
const fs = require('fs')
const vm = require('vm')

const { clone, pull } = require('isomorphic-git')
const http = require('isomorphic-git/http/node')

function getLatest(from, to, cb) {
  let url
  try {
    url = new URL(from)
  } catch(e) {
    return cb(e)
  }
  let name = path.basename(url.pathname, ".git")
  to = path.join(to, name)
  fs.lstat(to, (err, stats) => {
    if(err && err.code === "ENOENT") cloneRepo(from, to, cb)
    else if(err) cb(err)
    else updateRepo(from, to, cb)
  })
}

function cloneRepo(from, to, cb) {
  clone({
    fs,
    http,
    dir: to,
    url: from,
  }).then(() => cb(null, to))
  .catch(cb)
}

function updateRepo(from, to, cb) {
  pull({
    fs,
    http,
    dir: to,
    fastForwardOnly: true,
    author: { name: "invalid", email: "in@valid.com" },
  }).then(() => cb(null, to))
  .catch(cb)
}

function getInfo(loc, name, cb) {
  getPlugin(loc, name, (err, plugin) => {
    if(err) cb(err)
    else if(!plugin) return cb("Plugin not found")
    else if(!plugin.code) return cb("Plugin code not found")
    else {
      let context = {
        plugin: {name, info:{}},
      }
      try {
        vm.createContext(context)
        plugin.code.runInContext(context)
        return cb(null, context.plugin.info)
      } catch(e) {
        cb(e)
      }
    }
  })
}

function getPlugin(loc, name, cb) {
  getPlugins(loc, (err, plugins) => {
    if(err) cb(err)
    else {
      let plugin = plugins[name]
      if(!plugin) return cb("No Matching Plugin")
      loadPlugin(plugin, (err, plugin) => {
        if(err) cb(err)
        else cb(null, plugin)
      })
    }
  })
}

function loadPlugin(plugin, cb) {
  if(plugin.loaded) return cb(null, plugin)
  fs.readFile(plugin.p, (err, code) => {
    if(err) cb(err)
    else {
      try {
        plugin.code = new vm.Script(code)
        cb(null, plugin)
      } catch(e) {
        cb(e)
      }
    }
  })
}

function getPlugins(loc, cb) {
  fs.readdir(loc, { withFileTypes: true }, (err, files) => {
    if(err) cb(err)
    else {
      let plugins = {}
      for(let i = 0;i < files.length;i++) {
        let f = files[i]
        if(f.name[0] !== '.'
            && f.isFile()
            && f.name.endsWith(".js")) {
          let n = path.basename(f.name, ".js")
          let p = path.join(loc, f.name)
          plugins[n] = { p }
        }
      }
      cb(null, plugins)
    }
  })

  function load_1(p) {

  }
}

module.exports = {
  getLatest,
  getPlugin,
  getInfo,
}
