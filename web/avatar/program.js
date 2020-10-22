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
    "Setting up",
    { proc: "setup" },
    "Getting users",
    users.get,
    "Checking user status",
    { proc: "dothework" },
  ],

  setup,

  /*    way/
   * get the tasks for the users, schedule and do them
   */
  dothework: [
    tasks.userStatus,
    //{ proc: "dothework" },
  ],


  /*    understand/
   * if there are errors in the flow, any step can call
   * exit and stop the work
   */
  exit: [
    () => `Bye for now. If you want me to start work again, please logout and re-login!`
  ],
}
