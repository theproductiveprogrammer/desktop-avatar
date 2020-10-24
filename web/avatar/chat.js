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
    "I'm going to do a quick check of our setup...",
    "I'm going to do a quick check of the settings...",
    "I'm going to do a quick check of our setup...:mag:",
    "I'm going to do a quick check of the settings...:mag:",
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

function gettingUsers() {
  return dh.oneOf(
    "First let me check which users I am assigned to work for...",
    "Let's start by checking if there are any other users we should be working with...",
    "First, I am going to check with the server if there are any other users we need to work with..."
  )
}

function errGettingUsers() {
    return `**Error Getting Users**!

I will notify the developers of this issue. In the meantime you can check the message logs and see if that gives you any ideas.
`
}

function errGettingTasks() {
    return `**Error Getting Tasks**!

Failed to get tasks from the server.
`
}

function manageUsers(users) {
  if(users.length == 0) {
    return dh.oneOf(
      "Currently you do not have any other users to manage",
      "You do not have any other users to manage",
      "You have no other users to manage",
      "I did not find any other users for you to manage"
    )
  }
  return dh.oneOf(
    `You have ${users.length} users to manage`,
    `Found ${users.length} users for you to manage`,
    `You have ${users.length} users to work with`
  )
}

function noticeReport() {
  return dh.oneOf(
    "I'll show you a report of the work I'm doing on the report pane to the right",
    "You can see the work we're doing on the report pane to the right",
    "To help you see what's going on we'll update working reports on the right hand side pane"
  )
}

function gotTasks(tasks) {
  return `Giving you ${tasks.length} task(s) to do`
}


module.exports = {
  greeting,
  letsGetStarted,
  checkingSetup,
  needServerURL,
  looksGood,
  gettingUsers,
  errGettingUsers,
  manageUsers,
  noticeReport,
  gotTasks,
  errGettingTasks,
}
