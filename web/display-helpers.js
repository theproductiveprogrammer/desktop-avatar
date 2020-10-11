'use strict'

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
  let hh = (new Date()).getHours()
  if(hh >= 6 && hh < 12) return "Good Morning"
  if(hh >= 12 && hh < 16) return "Good Afternoon"
  return "Good Evening"
}


module.exports = {
  userName,
  greeting,
  timeZone,
}
