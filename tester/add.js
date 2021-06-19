'use strict'
const req = require('@tpp/req')

const serverURL = 'http://localhost:5555'

/*    understand/
 * main entry point into our program
 */
function main() {
  const fns = {
    user,
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

function err_(m) {
  console.error(m)
}


main()
