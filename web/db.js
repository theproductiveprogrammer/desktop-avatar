'use strict'
const req = require("@tpp/req")

const PORT = 7749

/*    way/
 * get a set of messages from the log file pass to the processor and ask
 * the scheduler how/when to continue
 */
function get(log, processor, scheduler) {
  let from = 1
  let u = `http://localhost:${PORT}/get/${log}?from=`
  get_1()

  function get_1() {
    let uu = u + from
    req.get(uu, (err, resp, status, hdrval) => {
      let tm = 0
      if(hdrval) {
        let hdrs = req.headers(hdrval)
        let last = hdrs["x-kafjs-lastmsgsent"]
        if(last) {
          try {
            last = parseInt(last)
            if(!isNaN(last)) from = last + 1
          } catch(e) {
            tm = scheduler(err)
          }
        }
      }
      if(err) tm = scheduler(err)
      if(status != 200) tm = scheduler(`get: responded with ${status}`)
      try {
        if(resp && resp.length) processor(resp)
        if(!resp || resp.length == 0) tm = scheduler(null, true)
      } catch(e) {
        tm = scheduler(e)
      }

      if(tm) setTimeout(get_1, tm)
    })
  }
}

/*    understand/
 * put the logs in the order they come in and retry until sucessful
 */
let PENDING = []
let sending
function sendPending() {
  if(sending || !PENDING || !PENDING.length) return
  sending = true

  let m = PENDING[0]

  let u = `http://localhost:${PORT}/put/${m.log}`
  req.post(u, m.msg, (err, resp, status) => {
    sending = false

    if(status != 200 && !err) err = `responded with status: ${status}`
    if(err) {
      console.error(err)
      setTimeout(sendPending, 2 * 1000)
    } else {
      PENDING.shift()
      sendPending()
    }
  })
}

/*    way/
 * add the message to the put queue and kick off the sending process
 */
function put(msg, log) {
  PENDING.push({ log, msg })
  sendPending()
}

module.exports = {
  put,
  get,
}
