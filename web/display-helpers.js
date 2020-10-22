'use strict'
const marked = require('marked')
const emoji = require('emojilib')

/*    way/
 * try our best to give show a good name from the data
 * we have about the user
 */
function userName(ui) {
  if(!ui) return "(no user)"
  let r = ui.title ? u.title + " " : ""
  if(ui.firstName && ui.lastName) {
    return r + ui.firstName + " " + ui.lastName
  }
  if(ui.firstName) return r + ui.firstName
  if(ui.lastName) return r + ui.lastName
  return "(no name)"
}

/*    way/
 * return user timezone (default to GMT)
 */
function timeZone(ui) {
  return ui.timeZone || "GMT"
}

/*    way/
 * return a random smiley emoji
 */
function smiley() {
  return anEmoji("smile")
}

/*    way/
 * randomly pick an emoji that matches the given keyword
 */
function anEmoji(keyword) {
  let options = []
  for(let k in emoji.lib) {
    let c = emoji.lib[k]
    if(c.keywords.indexOf(keyword)!=-1) {
      options.push(`:${k}:`)
    }
  }
  return oneOf(options)
}

/*    way/
 * greet the user based on the time of day or sometimes
 * just by wishing them generically
 */
function greeting() {
  let greetings = [
    "Hi there",
    "Hello",
    "Welcome",
    "Good to see you",
    "Hi",
  ]
  if(Math.random() > 0.7) {
    return oneOf(greetings)
  }
  let hh = (new Date()).getHours()
  if(hh >= 6 && hh < 12) return "Good Morning"
  if(hh >= 12 && hh < 16) return "Good Afternoon"
  return "Good Evening"
}

/*    way/
 * return the parsed version of the markdown text
 */
function md(txt) {
  return marked(txt)
}

/*    outcome/
 * Find emoji shortcodes and replace them with the HTML
 * equivalents
 */
function emojify(txt) {
  let rx = /:[a-z_]*:/g
  return txt.replace(rx, sc => {
    let e = sc.substring(1, sc.length-1)
    if(!emoji.lib[e]) return sc
    return "&#" + emoji.lib[e].char.codePointAt(0) + ";"
  })
}

/*    way/
 * check if the given text is nothing but emoji's
 */
function isJustEmojis(txt) {
  let rx = /:[a-z_]*:/g
  txt = txt.replace(rx, "")
  return !txt.trim()
}

/*    way/
 * randomly pick one of the arguments (or one of the array
 * of elements passed in)
 */
function oneOf(a) {
  if(!Array.isArray(a)) a = Array.prototype.slice.call(arguments)
  return (a && a.length)
    ? a[Math.floor(Math.random()*a.length)]
    : ""

}

module.exports = {
  userName,
  greeting,
  timeZone,
  md,
  emojify,
  smiley,
  anEmoji,
  isJustEmojis,
  oneOf,
}
