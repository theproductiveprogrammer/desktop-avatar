'use strict'
const loc = require('./loc.js')
const fs = require('fs')
const path = require('path')
var CryptoJS = require("crypto-js");

function saveLoginInfo(usr,pwd){
  const f = path.join(loc.home(), "logininfo.json")
  var ciphertext = CryptoJS.AES.encrypt(pwd, 'secret key 123').toString(); 
    var obj = {
          username : usr,
          password: ciphertext
        }
        fs.writeFile(f, JSON.stringify(obj), 'utf8', function (err) {
          if (err) {
            return console.log(err);
          }
        })
}

function getUserLoginInfo(cb){
  const f = path.join(loc.home(), "logininfo.json");
  if(fs.existsSync(f)) {
    fs.readFile(f, "utf8", (err, data) => {
      if (err) throw err;
      let loginInfo = JSON.parse(data);
      var bytes = CryptoJS.AES.decrypt(loginInfo.password, "secret key 123");
      var pwd = bytes.toString(CryptoJS.enc.Utf8);
      loginInfo.password = pwd;
      try{
        loginInfo = JSON.parse(JSON.stringify(loginInfo));
      }catch(err){
        loginInfo=null
        console.error(err)
      }
      cb(loginInfo); 
    });
  }
    else cb(null)
  }

function removeLoginInfo(){
  const f = path.join(loc.home(), "logininfo.json");
  fs.unlink(f, function (err) {
    if (err) throw err;
});
}

module.exports = {
    saveLoginInfo,
    getUserLoginInfo,
    removeLoginInfo
}
