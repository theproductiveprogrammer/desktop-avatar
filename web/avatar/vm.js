'use strict'

/*    understand/
 * We are building a full-fledged (if tiny) virual machine that runs our
 * program. This virtual machine reacts to user logins - kicking off
 * the "main" proc when a new user is found and the "exit" procedure
 * when a user logs out.
 *
 *    way/
 * Start by creating an environment for the virtual machine to execute
 * under and invoke the entry/exit procs
 */
function start(log, store, program) {
  let env = newEnv(log, store, program)

  store.react('ui', ui => {
    if(env.ui && !ui) runProc(env, "exit")
    env.ui = ui
    if(env.ui) runProc(env, "main")
  })
}

/*    understand/
 * This special symbol is used to signal a RETURN from a procedure
 */
const RETURN = {}


/*    understand/
 * This is the environment which holds global variables (we don't have
 * variable scoping), the program stack and the procedures that the
 * program contains.
 */
function newEnv(log, store, program) {
  return {
    ui: null,
    log,
    store,
    program,
    vars: {},
    stack: [],
    proc: [],
    runptr: {},
  }
}

/*    way/
 * set up the run pointer to point to the proc, push the last caller
 * onto the call stack (handling tail recursion correctly) and execute
 * the first line of the proc
 */
function runProc(env, name) {
  let proc = env.program[name]
  if(!proc) {
    env.log("err/avatarvm/run/noproc", {
      name,
      stack: env.stack,
    })
    return
  }
  let runptr = {
    name,
    ndx: 0
  }

  let is_tail_call = env.runptr.name &&
    runptr.name == env.runptr.name &&
    env.runptr.ndx == env.proc.length-1

  if(env.runptr.name && !is_tail_call) {
    env.stack.push({
      proc: env.proc,
      runptr: env.runptr,
    })
  }
  env.proc = proc
  env.runptr = runptr
  env.log.trace("avatarvm/run/begin", env.runptr.name)
  run_(env)
}

/*    way/
 * Get the current proc line, update the run pointer, and execute the
 * line, moving to the next or invoking another procedure if requested.
 */
function run_(env) {
  let line = env.proc[env.runptr.ndx]
  env.log.trace("avatarvm/running", {
    ptr: env.runptr, line
  })
  if(!line) {
    env.log.trace("avatarvm/run/fin", env.runptr)
    return
  }
  env.runptr.ndx++
  exec_(env, line, proc => {
    if(proc) runProc(env, proc)
    else run_(env)
  })
}

/*    way/
 * pops the last run pointer off the call stack which allows us to
 * resume execution from where we left off
 */
function return_(env) {
  env.log.trace("avatarvm/run/return", env.runptr)
  let { proc, runptr } = env.stack.pop()
  env.proc = proc
  env.runptr = runptr
}

/*    understand/
 * the avatar understands:
 *    + simple strings: it's a chat message
 *    + an object: with the following keys
 *      { proc: "call next proc name" }
 *      { chat: "chat msg - just like a simple string" }
 *      { from: <user info>, chat: ... }
 *      { wait: <delay in milliseconds> }
 *    + a function:
 *        invoked with an environment containing:
 *          { vars: // context variables to pass around
 *            store: // the store
 *            log: // the log
 *            say: // shows chat message
 *          }
 *          env => ...env.say("Hello there")
 *        can return a simple string or an object as
 *        described above.
 *        Can also return nothing - in this case the
 *        second parameter is a callback that the function
 *        must invoke when it's done. The callback
 *        again accepts a string/object as described above
 *    + RETURN:
 *        returns from the current proc invocation
 *
 *    examples/
 *  "Hello there!"    // shows chat message "Hello There"
 *  { proc: "abc" }   // starts running proc "abc"
 *  { chat: "Hi!" }   // shows chat message "Hi"
 *  { from: user1.ui, chat:... } // chat message from user1
 *  { wait: 500 }     // wait for 500 ms before next step
 *                    // by default waits for 1-5 seconds
 *  () => (new Date()).toISOString() // show current date
 *  ({vars}) => `Hi ${vars.name}` // uses variables
 *  ({vars,store}) => if(...) return { proc: "def" }
 *  (env, cb) => {
 *      if(x) {
 *        goToTheWeb(andDosomething).then(() => {
 *            cb({ chat: "ok done!", proc: "nextproc" })
 *        })
 *      } else {
 *        goToTheWeb(andDosomething).then(() => cb())
 *      }
 *  }
 *
 *    way/
 * If the current line a RETURN, then invoke the special RETURN handler,
 * otherwise if is a function, invoke it and handle it's callback
 * and return value or just run the line directly
 */
function exec_(env, line, cb) {

  if(line === RETURN) {

    return_(env)
    cb()

  } else if(typeof line === "function") {
    const env_ = {
      vars: env.vars,
      store: env.store,
      log: env.log,
      say: msg => newMsg(env, msg),
    }
    let ret = line(env_, run_line_1)
    if(ret) run_line_1(ret)

  } else {

    run_line_1(line)
  }

  function run_line_1(obj) {
    if(!obj) obj = {}
    if(typeof obj == "string") obj = { chat: obj }
    newMsg(env, obj)
    let delay = Math.random() * 4000 + 1000
    if(!obj.chat) delay = 0
    if(obj.wait) delay = obj.wait
    setTimeout(() => cb(obj.proc), delay)
  }
}

/*    way/
 * create a new chat for the requested bot and add it to the store.
 */
function newMsg(env, msg) {
  if(!msg || !msg.chat) return
  let from = find_bot_1(env, msg)

  store.event("msg/add", {
    t: (new Date()).toISOString(),
    from,
    chat: msg.chat
  })

  /*    way/
   * If the message contains a 'from' field we use that (special case -1
   * == from server) or we use the environment's current user.
   */
  function find_bot_1(env, msg) {
    if(msg.from === -1) return serverBot()
    let ui = env.ui
    if(msg.from) ui = msg.from
    if(!ui) return emptyBot()
    if(!ui.bots || !ui.bots.length) return {
      id: ui.id,
      firstName: ui.firstName,
      lastName: ui.lastName,
      title: ui.title,
      userName: ui.userName,
      logo: ui.pic
    }
    let bot
    for(let i = 0;i < ui.bots.length;i++) {
      bot = ui.bots[i]
      if(bot.logo) break
    }
    return {
      id: bot.id,
      userName: bot.userName,
      firstName: bot.firstName,
      lastName: bot.lastName,
      title: bot.title,
      logo: bot.logo || ui.pic,
    }
  }

  function serverBot() {
    return {
      id: -1,
      userName: "salesbox.ai",
      firstName: "SalesBox",
      logo: "./bothead.png",
    }
  }
  function emptyBot() {
    return {
      id: 0,
      userName: "(null)",
      firstName: "(No Name)",
      logo: "./empty-bot.png",
    }
  }

}

module.exports = {
  start,
  RETURN,
}


