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
  let p = `get/${log}?from=`
  let options = {
    hostname: "localhost",
    port: PORT,
    method: "GET",
  }

  let from = 1
  function get_1() {
    options.path = p + from
    send(options, null, (status, err, resp, headers) => {
      let tm = 0
      if(headers) {
        let last = headers["x-kafjs-lastmsgsent"]
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
        let data = JSON.parse(resp)
        if(data && data.length) processor(data)
        if(!data || data.length == 0) tm = scheduler(null, true)
      } catch(e) {
        tm = scheduler(e)
      }

      if(tm) setTimeout(get_1, tm)
    })
  }
}

/*    way/
 * post the message to the requested log file, retrying
 * until successful
 */
function put(msg, log) {
  let options = {
    hostname: "localhost",
    port: PORT,
    path: `/put/${log}`,
    method: "POST",
  }
  send(options, msg, (status, err, resp) => {
    if(err) console.error(err)
    if(status == 200) return
    setTimeout(() => put(msg, log), 2 * 1000)
  })
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