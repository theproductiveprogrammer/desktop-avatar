'use strict'
const dh = require('../display-helpers.js')

function greeting({store}) {
  return dh.greeting(store.get("ui"))
}

function letsGetStarted({say}, cb) {
  const ops = [
    [ "Let's get to work today :fire:", dh.smiley() ],
    [ "Let's get started! :+1:", ":sunglasses:" ],
    [ "Let's see what we've got to do...", ":monocle:" ],
  ]

  const msgs = dh.oneOf(ops)
  say(msgs[0])
  setTimeout(() => {
    say(msgs[1])
    cb()
  }, 900)
}

module.exports = {
  greeting,
  letsGetStarted,
}
