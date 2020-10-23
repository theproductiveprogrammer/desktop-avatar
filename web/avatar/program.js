'use strict'
const setup = require('./setup.js')
const users = require('./users.js')
const tasks = require('./tasks.js')

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
   * greet the user, set up any missing parameters, get the
   * list of users on whose behalf we are going to work and
   * get to it.
   */
  main: [
    chat.greeting,
    { call: "setup" },
    users.get,
    chat.letsGetStarted,
    { call: "dothework" },
  ],

  setup,

  /*    way/
   * get the tasks for the users, schedule and do them, then
   * rest a bit before repeating
   */
  dothework: [
    { call: gettasks },
    { call: schedule },
    doWork,
    takeANap,
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

  /*    way/
   * schedule the next task for the user, and apply rate
   * limiting on top
   */
  schedule: [
    schedule.nextTask,
    schedule.pullWithRateLimiting,
  ],


  /*    understand/
   * if there are errors in the flow, any step can call
   * exit and stop the work
   */
  exit: [
    () => `Bye for now. If you want me to start work again, please logout and re-login!`
  ],
}
