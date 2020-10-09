'use strict'
const kc = require('./kafclient.js')

module.exports = (LOGNAME, traceOn) => {

  function log(e, data) {
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
    kc.put(msg, LOGNAME)
  }

  function trace(e, data) {
    if(!data && typeof e === "object") {
      data = e
      e = ""
    }
    if(!e) e = "trace/"
    else if(typeof e !== 'object') e = `trace/${e}`
    log(e, data)
  }


  log.getName = () => LOGNAME

  if(traceOn) {
    log.trace = trace
  } else {
    log.trace = () => true /* silently eat */
  }

  return log
}
