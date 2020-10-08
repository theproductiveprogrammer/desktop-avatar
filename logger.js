'use strict'
const kc = require('./kafclient.js')

module.exports = (LOGNAME, withdump) => {

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
    return msg
    kc.put(msg, LOGNAME)
  }

  log.getName = () => LOGNAME

  if(withdump) {
    log.dump = log
  } else {
    log.dump = () => true /* silently eat */
  }

  return log
}
