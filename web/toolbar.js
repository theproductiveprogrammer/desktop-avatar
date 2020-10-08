'use strict'
const { h } = require('@tpp/htm-x')

import "./toolbar.scss"

/*    way/
 * put a "settings" and "hamburger" button
 */
function show(store) {
  let tb = h(".toolbar")
  let settings = h("img.settings", {
    src: "./settings.svg",
    onclick: () => window.show.settings()
  })
  let hamburger = h("img.hamburger", {
    src: "./hamburger.svg",
    onclick: () => store.event("logview/show")
  })

  store.get("e").appendChild(tb)
  tb.c(settings, hamburger)
}

module.exports = {
  show
}
