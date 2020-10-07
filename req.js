'use strict'
const http = require('http')

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
  req.on("error", callback_1)

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
  send,
}
