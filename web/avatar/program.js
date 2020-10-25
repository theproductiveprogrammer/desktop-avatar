'use strict'
const setup = require('./setup.js')
const users = require('./users.js')
const tasks = require('./tasks.js')
const chat = require('./chat.js')
const schedule = require('./schedule.js')

/*    problem/
 * the avatar is a kind of chatbot that communicates with
 * the user and does various tasks. We would like to write
 * this flow in a type of chat script - a DSL that would
 * make the chat program easier to understand and change.
 *
 *    way/
 * we write the chat script in the form of chat message
 * strings, objects to control the flow, and functions
 * for doing more complicated things - all driven by
 * an avatar virtual machine that understands this program
 * script and executes it: entering from "main" and ending
 * at "exit"
 * See also `vm.js` for more details
 */
module.exports = {

  /*    way/
   * greet the user, set up and download plugins, get the
   * list of users on whose behalf we are going to work and
   * get to it.
   */
  main: [
    chat.greeting,
    chat.letsGetStarted,
    { call: "setup" },
    setup.getPlugins,
    chat.looksGood,
    chat.gettingUsers,
    users.get,
    chat.noticeReport,
    { call: "dothework" },
  ],

  /*    way/
   * check if we have a server url set then return. If not,
   * open the settings window and wait until the user
   * provides us with a server URL
   */
  setup: [
    chat.checkingSetup,
    setup.checkServerURL,
    chat.needServerURL,
    setup.openSettingsWindow,
    setup.waitForServerURL,
  ],

  /*    way/
   * get the tasks for the users, schedule and do them, then
   * rest a bit before repeating
   */
  dothework: [
    { call: "gettasks" },
    schedule.tasks,
    //doWork,
    schedule.takeANap,
    { call: "dothework" },
  ],

  /*    way/
   * check for existing user tasks and get additional tasks 
   * from the server
   */
  gettasks: [
    tasks.userStatus,
    tasks.fromServer,
  ],


  /*    understand/
   * if there are errors in the flow, any step can call
   * exit and stop the work
   */
  exit: [
    "Bye for now :zzz:"
  ],
}
