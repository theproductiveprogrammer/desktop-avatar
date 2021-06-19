'use strict'
const req = require('@tpp/req')

const serverURL = 'http://localhost:5555'

/*    understand/
 * main entry point into our program
 */
function main() {
  const fns = {
    user,
    task,
    help,
    "-h": help,
    "--help": help,
  }
  const what = process.argv[2]
  const handler = fns[what] || help
  handler(process.argv.slice(3))
}

function help() {
  console.log(`Usage:
  add user name password
  add task [view|connect|msg] userid linkedin-url/id [field value, field value, ....]
`)
}

function user(args) {
  const usr = args[0]
  const pwd = args[1]
  if(!usr || !pwd) return err_(`Missing username/password`)
  req.post(serverURL + '/user/add', { usr, pwd }, err => {
    if(err) err_(err)
  })
}

function task(args) {
  const t = {
    action: action_1(args[0]),
    userId: args[1],
    linkedInURL: ll_url_1(args[2]),
  }
  for(let i = 3;i < args.length;i+=2) {
    const n = args[i]
    const v = args[i+1]
    if(n && v) t[n] = v
  }
  console.log(`Saving task: ${JSON.stringify(t)}`)
  req.post(serverURL + '/tasks/add', t, err => {
    if(err) err_(err)
  })

  function action_1(a) {
    const m = {
      view: "LINKEDIN_VIEW",
      connect: "LINKEDIN_CONNECT",
      msg: "LINKEDIN_MSG",
      disconnect: "LINKEDIN_DISCONNECT",
      "check-connect": "LINKEDIN_CHECK_CONNECT",
      "check-msg": "LINKEDIN_CHECK_MSG",
    }
    return m[a]
  }

  function ll_url_1(u) {
    if(u.startsWith("http")) return u
    return `https://www.linkedin.com/in/${u}/`
  }
}

function err_(m) {
  console.error(m)
}


main()
