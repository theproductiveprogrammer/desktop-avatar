'use strict'
const marked = require('marked')
const emoji = require('emojilib')

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

function smiley() {
  return anEmoji("smile")
}

function anEmoji(keyword) {
  let options = []
  for(let k in emoji.lib) {
    let c = emoji.lib[k]
    if(c.keywords.indexOf(keyword)!=-1) options.push(c.char)
  }
  return options[Math.floor(Math.random()*options.length)]
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

/*    outcome/
 * Find emoji shortcodes and replace them with the HTML
 * equivalents
 */
function emojify(txt) {
  console.log(txt)
  let rx = /:[a-z_]*:/g
  return txt.replace(rx, sc => {
    let e = sc.substring(1, sc.length-1)
    if(!emoji.lib[e]) return sc
    return "&#" + emoji.lib[e].char.codePointAt(0) + ";"
  })
}

module.exports = {
  userName,
  greeting,
  timeZone,
  md,
  emojify,
  smiley,
  anEmoji,
}
