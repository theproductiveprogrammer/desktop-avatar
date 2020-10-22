'use strict'
const setup = require('./setup.js')
const users = require('./users.js')
const tasks = require('./tasks.js')

module.exports = {
  main: [
    "Setting up",
    { proc: "setup" },
    "Getting users",
    users.get,
    "Checking user status",
    tasks.userStatus,
  ],

  setup,

  exit: [
    () => `Bye for now`
  ],
}
