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

  store.react('user.ui', ui => {
    let old = env.ui
    env.ui = ui
    if(ui && (!old || old.id !== ui.id)) {
      store.event("msg/clear")
      loadProc("main", env)
      run_(env)
    }
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
    runptr: {},
    recursion_depth: 0,
  }
}

function proc_(env, name) { return env.program[name] }

/*    way/
 * set up the run pointer to point to the proc, pushing the last caller
 * onto the call stack and handling tail recursion correctly
 */
function loadProc(name, env) {
  const old = env.runptr
  env.runptr = {}

  const p = proc_(env, name)
  if(!p) {
    env.log("err/avatarvm/run/noproc", {
      name,
      stack: env.stack,
    })
    return
  }

  const op = proc_(env, old.name)
  const is_tail_call = op && name == old.name && old.ndx == op.length-1

  if(old.name && !is_tail_call) {
    env.stack.push(old)
    env.log.trace("avatarvm/run/begin", name)
  }
  env.runptr = {
    name,
    ndx: 0,
  }
}

/*    way/
 * Get the current proc line, update the run pointer, and execute the
 * line, moving to the next or invoking another procedure if requested.
 */
function run_(env) {
  if(env.recursion_depth++ > 32) {
    env.recursion_depth = 0
    return setTimeout(() => run_(env))
  }
  const p = proc_(env, env.runptr.name)
  if(env.runptr.ndx < p.length) {
    const line = p[env.runptr.ndx]

    if(typeof line === "function") {
      env.log.trace("avatarvm/running", {
        ptr: env.runptr, line: line.name
      })
    } else {
      env.log.trace("avatarvm/running", {
        ptr: env.runptr, line: line
      })
    }

    if(!line) {
      env.log("err/avatarvm/run/step/missing", {
        ptr: env.runptr
      })

    } else {

      env.runptr.ndx++
      exec_(env, line, proc => {
        if(proc) loadProc(proc, env)
        run_(env)
      })
    }

  } else {

    env.log.trace("avatarvm/run/fin", env.runptr.name)

    if(env.runptr.name !== "exit") {
      return_(env)
      if(!env.runptr.name) loadProc("exit", env)
      run_(env)
    }

  }

}

/*    way/
 * pops the last run pointer off the call stack which allows us to
 * resume execution from where we left off
 */
function return_(env) {
  env.runptr = env.stack.pop() || {}
}

/*    understand/
 * the avatar understands:
 *    + simple strings: it's a chat message
 *    + an object: with the following keys
 *      { call: "next proc name" }
 *      { chat: "chat msg - just like a simple string" }
 *      { from: <user info>, chat: ... }
 *      { wait: <delay in milliseconds> }
 *    + a function:
 *        invoked with an environment containing:
 *          { vars: // context variables to pass around
 *            store: // the store
 *            log: // the log
 *            say: // shows chat message
 *            RETURN: // causes return from current proc
 *          }
 *          env => ...env.say("Hello there", () => ...)
 *        can return a simple string or an object as
 *        described above.
 *        Can also return nothing - in this case the
 *        second parameter is a callback that the function
 *        must invoke when it's done. The callback
 *        again accepts a string/object as described above
 *    + RETURN:
 *        returns from the current proc invocation
 *        (accessible from the `env` passed into a function)
 *
 *    examples/
 *  "Hello there!"    // shows chat message "Hello There"
 *  { call: "abc" }   // starts running proc "abc"
 *  { chat: "Hi!" }   // shows chat message "Hi"
 *  { from: user1.ui, chat:... } // chat message from user1
 *  { wait: 500 }     // wait for 500 ms before next step
 *                    // by default waits for 1-5 seconds
 *  () => (new Date()).toISOString() // show current date
 *  ({vars}) => `Hi ${vars.name}` // uses variables
 *  ({vars,store}) => if(...) return { call: "def" }
 *  (env, cb) => {
 *      if(x) {
 *        goToTheWeb(andDosomething).then(() => {
 *            cb({ chat: "ok done!", call: "nextproc" })
 *        })
 *      } else {
 *        goToTheWeb(andDosomething).then(() => cb())
 *      }
 *  }
 *
 *    way/
 * If the current line is a RETURN, then invoke the special RETURN handler,
 * otherwise if is a function, invoke it and handle it's callback
 * and return value or just run the line directly
 */
function exec_(env, line, cb) {
  if(env.recursion_depth++ > 32) {
    env.recursion_depth = 0
    return setTimeout(() => exec_(env, line, cb))
  }

  let delay = Math.random() * 4000 + 1000

  if(line === RETURN) {

    env.log.trace("avatarvm/run/return", env.runptr)
    return_(env)
    cb()

  } else if(typeof line === "function") {

    const env_ = {
      vars: env.vars,
      store: env.store,
      log: env.log,
      RETURN,
      say: (msg, cb) => {
        let delay = Math.random() * 4000 + 1000
        newMsg(env, msg)
        if(msg.wait) delay = msg.wait
        setTimeout(() => cb(), delay)
      },
    }
    let responded = false
    let ret = line(env_, nxt => {
      if(responded) return
      responded = true
      exec_(env, nxt, cb)
    })
    if(ret) exec_(env, ret, cb)

  } else {

    newMsg(env, line)

    if(!line) line = {}
    if(!line.chat && typeof line !== "string") delay = 0
    if(line.wait) delay = line.wait
    setTimeout(() => cb(line.call), delay)

  }
}

/*    way/
 * create a new chat for the requested bot and add it to the store.
 */
function newMsg(env, msg) {
  if(!msg) return
  if(typeof msg == "string") msg = { chat: msg }
  if(!msg.chat) return

  let from = find_bot_1(env, msg)

  env.store.event("msg/add", {
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
}


