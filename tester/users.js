'use strict'
const bdb = require('baby-db')

const USERS = {}
let ondone_

const userdb = bdb('users.json')
userdb.on('error', err => console.error(err))
userdb.on('rec', rec => {
  if(!rec.usr) throw `Did not understand: ${JSON.stringify(rec)}`
  if(USERS[rec.usr]) Object.assign(USERS[rec.usr], rec)
  else USERS[rec.usr] = rec
})
userdb.on('done', () => {
  console.log('User DB loaded...')
  ondone_ && ondone_()
})
userdb.onExitSignal(() => process.exit())


module.exports = {
  add: userdb.add,
  ondone: cb => ondone_ = cb,
}
