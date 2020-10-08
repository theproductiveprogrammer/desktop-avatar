'use strict'
const req = require('@tpp/req')

const PORT = 7749

/*    way/
 * get a set of messages from the log file pass to the processor and ask
 * the scheduler how/when to continue. Returns a control structure that
 * can be used to stop getting more data (aside from using the scheduler)
 */
function get(log, processor, scheduler) {
  let ctrl = { stop:false }
  let from = 1
  let p = `http://localhost:${PORT}/get/${log}?from=`
  get_1()
  return ctrl

  function get_1() {
    if(ctrl.stop) return

    let u = p + from
    req.get(u, (err, resp) => {
      if(ctrl.stop) return

      let last = resp.headers()["x-kafjs-lastmsgsent"]
      if(last) {
        last = parseInt(last)
        if(!isNaN(last)) from = last + 1
      }
      if(err) return schedule_1(err)
      if(resp && !Array.isArray(resp.body)) {
        return schedule_1({ err: "bad response", resp })
      }
      let end = (resp && resp.length) ? false : true
      if(!end) processor(resp)
      return schedule_1(null, end)
    })
  }

  function schedule_1(err, end) {
    let tm = scheduler(err, end)
    if(tm) setTimeout(get_1, tm)
  }

}

/*    understand/
 * put the logs in the order they come in, retrying on failure
 */
let PENDING = []
let sending
function sendPending() {
  if(sending || !PENDING.length) return
  sending = true

  let m = PENDING[0]

  let u = `http://localhost:${PORT}/put/${m.log}`
  req.post(u, m.msg, (err, resp) => {
    sending = false
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
  PORT,
  put,
  get,
}

