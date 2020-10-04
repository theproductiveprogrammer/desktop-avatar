'use strict'
const { h } = require('@tpp/htm-x')

import "./settings.scss"

/*    understand/
 * Main entry point
 */
function main() {
  let cont = document.getElementById("cont")
  cont.innerHTML = ""

  let title = h(".title", "Settings")
  cont.appendChild(title)

  let form = h(".form")
  cont.appendChild(form)
}

main()
