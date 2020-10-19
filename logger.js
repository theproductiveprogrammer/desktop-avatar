'use strict'
const kc = require('./kafclient.js')

module.exports = (LOGNAME, traceOn) => {

  function log(e, data, cb) {
    if(!cb && typeof data === 'function') {
      cb = data
      data = undefined
    }
    let msg
    let t = (new Date()).toISOString()
    if(data) {
      if(data instanceof Error) {
        msg = { t, e, data: data.stack }
      } else {
        msg = { t, e, data }
      }
    } else {
      msg = { t, e }
    }
    kc.put(msg, LOGNAME, cb)
  }

  function trace(e, data, cb) {
    if(!cb && typeof data === 'function') {
      cb = data
      data = undefined
    }
    if(!data && typeof e === "object") {
      data = e
      e = ""
    }
    if(!e) e = "trace/"
    else if(typeof e !== 'object') e = `trace/${e}`
    log(e, data, cb)
  }

  function silentlyIgnore(e, data, cb) {
    if(!cb && typeof data === 'function') {
      cb = data
      data = undefined
    }
    cb && cb()
  }


  log.getName = () => LOGNAME

  if(traceOn) {
    log.trace = trace
  } else {
    log.trace = silentlyIgnore
  }

  return log
}
