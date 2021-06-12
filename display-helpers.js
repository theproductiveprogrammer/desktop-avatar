'use strict'
const marked = require('marked')
const emoji = require('emojilib')

/*    way/
 * try our best to give show a good name from the data
 * we have about the user
 */
function userName(ui) {
  if(!ui) return "(no user)"
  if(ui.firstName && ui.lastName) {
    return ui.firstName + " " + ui.lastName
  }
  if(ui.firstName) return ui.firstName
  if(ui.lastName) return ui.lastName
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
function greeting(ui) {
  if(ui) ui = ` ${userName(ui)}`
  else ui = ""

  const greetings = [
    "Hi there",
    "Hello",
    "Welcome",
    "Good to see you",
    "Hi",
  ]
  if(Math.random() > 0.7) {
    return oneOf(greetings) + ui
  }
  let hh = (new Date()).getHours()
  if(hh >= 6 && hh < 12) return "Good Morning" + ui
  if(hh >= 12 && hh < 16) return "Good Afternoon" + ui
  return "Good Evening" + ui
}

/*    way/
 * return the parsed version of the markdown text
 */
function md(txt) {
  return marked(txt)
}

/*    understand/
 * emoji shortcodes are like :smile:, :fire:, :+1:
 */
const rxMoj = /:[-+0-9a-z_]*:/g

/*    outcome/
 * Find emoji shortcodes and replace them with the HTML
 * equivalents
 */
function emojify(txt) {
  return txt.replace(rxMoj, sc => {
    return moj(sc.substring(1, sc.length-1))
  })
}

/*    outcome/
 * return the emoji for the given shortcode
 */
function moj(code) {
  if(!emoji.lib[code]) return `:${code}:`
  let i = 0
  const c = emoji.lib[code].char
  let v = ""
  while(i < c.length) {
    let cp = c.codePointAt(i)
    i++
    if(cp > 65535) i++
    v += `&#${cp};`
  }
  return v
}

/*    way/
 * check if the given text is nothing but emoji's
 */
function isJustEmojis(txt) {
  txt = txt.replace(rxMoj, "")
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
  moj,
}
