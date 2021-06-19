'use strict'
const bdb = require('baby-db')

const USERS = {}
let maxid = 0
let ondone_

const userdb = bdb('users.json')
userdb.on('error', err => console.error(err))
userdb.on('rec', rec => {
  if(!rec.id) throw `Missing id ${JSON.stringify(rec)}`
  if(!rec.usr) throw `Did not understand: ${JSON.stringify(rec)}`
  if(rec.id > maxid) maxid = rec.id
  if(USERS[rec.usr]) Object.assign(USERS[rec.usr], rec)
  else USERS[rec.usr] = rec
})
userdb.on('done', () => {
  console.log('User DB loaded...')
  ondone_ && ondone_()
})

function add(user) {
  user.id = ++maxid
  userdb.add(user)
}

function login(user) {
  const u = USERS[user.usr]
  if(!u) return
  if(u.pwd === user.pwd) return enrich(u)
}

function enrich(u) {
  u.userName = u.userName || u.usr
  u.firstName = u.firstName || u.usr
  u.email = u.email || "test@test.com"
  u.timeZone = u.timeZone || "America/New_York"
  u.seed = u.seed || 1
  u.authKey = u.authKey || 1
  u.bots = u.bots || [
    {"id":3,"userName":"ava_charles","firstName":"Jennifer","lastName":"Jetson","title":null,"logo":"https://salesboxai.com/v6/assets/images/256_rsz_1andy-lee-642320-unsplash.jpg"}
  ]
  return u
}

module.exports = {
  add,
  login,
  ondone: cb => ondone_ = cb,
}
