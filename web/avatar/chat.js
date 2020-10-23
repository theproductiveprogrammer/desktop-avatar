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
  say({ chat: msgs[0], wait: 900 }, () => say(msgs[1], cb))
}

function checkingSetup() {
  return dh.oneOf(
    "Let me do a quick check of our setup...",
    "Let me do a quick check of the settings...",
    "Let me do a quick check of our setup...:mag:",
    "Let me do a quick check of the settings...:mag:",
  )
}

function needServerURL() {
  return "I need the server URL to be set so I can connect to the server.\n\nI get all sorts of information from it. Please set the serverURL for me to proceed"
}

function looksGood() {
  return dh.oneOf(
    "Everything looks good!",
    `Everything looks good! ${dh.anEmoji("good")}`,
    `It all looks good! ${dh.anEmoji("good")}`,
    `Everything Ok... ${dh.anEmoji("good")}`,
  )
}

module.exports = {
  greeting,
  letsGetStarted,
  checkingSetup,
  needServerURL,
  looksGood,
}
