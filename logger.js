'use strict'
const kc = require('./kafclient.js')

/*    understand/
 * our logger works by logging "events"
 *    log("mymodule/did/something")
 * the log can contain additional data
 *    log("mymodule/did/athing", helpful_data)
 *
 * all error events should start with "err/"
 *    log("err/inmymodule", e)
 *
 * from the perspective of this kind of app - the only
 * logging levels we need are
 *    (a) the actual logs - always tracked
 *    and
 *    (b) trace logs - helpful while debugging
 *
 * hence the logger allows us to call trace() which
 * is only enabled when the logger is initialized with
 * `traceOn`
 *      log.trace("trace/mymodule/did/something", debuginfo)
 */
module.exports = (LOGNAME, traceOn) => {

  /*    way/
   * log the event by posting it to the logfile, handling
   * error objects correctly by capturing their most useful
   * info (stacktrace)
   */
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

  /*    understand/
   * all trace logs should start with "trace/" for easy
   * identification
   */
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

  /*    understand/
   * ignore trace logs when not enabled
   */
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
    log.trace = trace /*TODO: silentlyIgnore */
  }

  return log
}
