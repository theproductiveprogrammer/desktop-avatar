'use strict'
const loc = require('./loc.js')
const fs = require('fs')
const path = require('path')
var CryptoJS = require("crypto-js");

function saveLoginInfo(usr,pwd){

  var ciphertext = CryptoJS.AES.encrypt(pwd, 'secret key 123').toString(); 
    var obj = {
          username : usr,
          password: ciphertext
        }
        fs.writeFile(path.join(loc.home(), "logininfo.json"), JSON.stringify(obj), 'utf8', function (err) {
          if (err) {
            return console.log(err);
          }
        })
}

function getUserLoginInfo(){
    var login_json=null
    try {
        if(fs.existsSync(path.join(loc.home(),"logininfo.json"))) {
            login_json=  fs.readFileSync(path.join(loc.home(),"logininfo.json"),"utf-8", (err, data) => {
                      if (err) throw err;
                      let loginInfo = JSON.parse(data)
                      return loginInfo
                  });
                  login_json=JSON.parse(login_json)
                  var bytes  = CryptoJS.AES.decrypt(login_json.password, 'secret key 123');
                  var pwd = bytes.toString(CryptoJS.enc.Utf8);
                   login_json.password=pwd
                   login_json =JSON.stringify(login_json)

        } 
    } catch (err) {
        console.error(err);
    }
  return login_json
  }

module.exports = {
    saveLoginInfo,
    getUserLoginInfo
}
