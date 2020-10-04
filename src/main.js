'use strict'
const { h } = require('@tpp/htm-x')

import "./main.scss"

/*    understand/
 * main entry point - it all starts here
 */
function main() {
  let cont = document.getElementById("cont")
  login(cont, userinfo => {
    console.log(userinfo)
  })
}

/*    way/
 * show the login page in the given container, and - after
 * login, send the details back using the callback.
 */
function login(cont, cb) {
  let form = h(".loginForm")
  cont.innerHTML = ""
  cont.appendChild(form)

  let title = h(".title", "Login")
  let inputs = h(".inputs")
  let name = h("input.name", {
    autofocus: true,
    placeholder: "Email or Username"
  })
  let pw = h("input.name", {
    type: "password",
    placeholder: "Password"
  })


  form.c(
    title,
    inputs.c( name, pw )
  )

}


main()
