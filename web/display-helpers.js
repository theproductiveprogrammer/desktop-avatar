'use strict'
const marked = require('marked')

function userName(ui) {
  if(!ui) return "(no user)"
  if(ui.firstName && ui.lastName) {
    return ui.firstName + " " + ui.lastName
  }
  if(ui.firstName) return ui.firstName
  if(ui.lastName) return ui.lastName
  return "(no name)"
}

function timeZone(ui) {
  return ui.timeZone || "GMT"
}


function greeting() {
  let greetings = [
    "Hi there",
    "Hello",
    "Welcome",
    "Good to see you",
    "Hi",
  ]
  if(Math.random() > 0.9) {
    return greetings[Math.floor(Math.random()*greetings.length)]
  }
  let hh = (new Date()).getHours()
  if(hh >= 6 && hh < 12) return "Good Morning"
  if(hh >= 12 && hh < 16) return "Good Afternoon"
  return "Good Evening"
}

function md(txt) {
  return marked(txt)
}


module.exports = {
  userName,
  greeting,
  timeZone,
  md,
}
