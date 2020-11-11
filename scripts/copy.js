'use strict'
const shell = require('shelljs')
shell.mkdir('-p','pub')
shell.cp(['web/*.svg','web/*.png'], 'pub/')