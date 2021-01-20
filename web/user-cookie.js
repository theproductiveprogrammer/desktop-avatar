'use strict'

import "./user-cookie.scss"

/*    understand/
 * main entry point into our program
 */
function main() {
  const btn = document.getElementById('btn')
  btn.onclick = () => saveCookieFile()
}

function saveCookieFile() {
  const username = document.getElementById('username').value;
  const userid = document.getElementById('userid').value;
  const value = document.getElementById('liatvalue').value;
  const err = check(username, userid, value)
  if(err) return alert(err)
  const info = {
    username,
    userid,
    cookie: {
      name: "li_at",
      domain: "www.linkedin.com",
      value,
    }
  }
  window.save.usercookie(info)
  .then(() => alert("Cookie Saved"))
  .catch(err => {
    alert("Failed to save Cookie")
    console.error(err)
  })
}

function check(username, userid, value) {
  if(!username) return "Usename is empty"
  if(!userid || isNaN(userid)) return "Userid is not valid"
  if(!value || value.length <= 100) return "Cookie is not valid"
}

main()
