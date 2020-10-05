'use strict'
const kaf = require('kafjs')
const loc = require('./loc.js')
const util = require('./util.js')

const http = require('http')

const PORT = 7749

/*    way/
 * ensure that the database directory exists then start the kaf db
 */
function start(logger, cb) {
  util.ensureExists(loc.db(), err => {
    if(err) cb(err)
    else startKaf(logger, cb)
  })
}

/*    problem/
 * We support multiple instances of the desktop avatar. At the same
 * time, we don't want them stomping over each other's data.
 *
 *    way/
 * Each avatar attempts to start up a database (actually an event store)
 * on a standard port. If it succeeds, it serves the rest of the
 * instances (including itself). If it fails, it goes to sleep and tries
 * again after sometime - just in case the existing instance is shut
 * down.
 */
function startKaf(logger, cb) {
  kaf.startServer(PORT, loc.db(), err => {
    if(err) {
      if(err.code === "EADDRINUSE") {
        setTimeout(start, 5 * 1000)
        cb && cb()
      } else {
        if(cb) cb(err)
        else console.error(err)
      }
    } else {
      logger.log("Started DB Server")
      cb && cb()
    }
  })
}

/*    way/
 * get a set of messages from the log file pass to the processor and ask
 * the scheduler how/when to continue
 */
function get(log, processor, scheduler) {
  let from = 1
  let p = `/get/${log}?from=`
  let options = {
    hostname: "localhost",
    port: PORT,
    method: "GET",
  }
  get_1()

  function get_1() {
    options.path = p + from
    send(options, null, (status, err, resp, headers) => {
      if(headers) {
        let last = headers["x-kafjs-lastmsgsent"]
        if(last) {
          try {
            last = parseInt(last)
            if(!isNaN(last)) from = last + 1
          } catch(e) {
            let tm = scheduler(err)
            if(tm) setTimeout(get_1, tm)
            return
          }
        }
      }
      if(status != 200 && !err)  err = `get: responded with ${status}`
      if(err) {
        let tm = scheduler(err)
        if(tm) setTimeout(get_1, tm)
        return
      }
      let tm
      try {
        resp = JSON.parse(resp)
        let end = (resp && resp.length) ? false : true
        if(!end) processor(resp)
        tm = scheduler(null, end)
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

  let options = {
    hostname: "localhost",
    port: PORT,
    path: `/put/${m.log}`,
    method: "POST",
  }
  send(options, m.msg, (status, err, resp) => {
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

/*    way/
 * send the request to the server, handling all the events correctly so
 * that the callback is only invoked once.
 */
function send(options, data, cb) {
  let req = http.request(options, res => {
    let body = []
    res.on("data", chunk => body.push(chunk))
    res.on("end", () => {
      callback_1(null, Buffer.concat(body), res.statusCode, res.headers)
    })
    if(options.timeout) {
      req.setTimeout(options.timeout, () => {
        callback_1("request timeout")
        req.abort()
      })
    }
    res.on("error", callback_1)
    res.on("close", () => callback_1("connection closed"))
  })

  if(data) req.write(JSON.stringify(data))
  req.end()

  let completed
  function callback_1(err, data, status, headers) {
    if(completed) return
    completed = true

    cb(status, err, data, headers)
  }
}

module.exports = {
  start,
  put,
  get,
}
