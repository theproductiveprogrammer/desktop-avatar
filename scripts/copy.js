'use strict'
const shell = require('shelljs')
shell.mkdir('-p','pub')
shell.cp(['web/*.svg','web/*.png'], 'pub/')
shell.mkdir('-p','pub/img')
shell.cp('web/default-bot-image.png', 'pub/img')
