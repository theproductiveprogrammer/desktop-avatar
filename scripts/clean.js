'use strict'
const shell = require('shelljs')
shell.rm('-rf', '.parcel-cache')
shell.rm('-rf', 'pub')
shell.rm('-rf', 'dist')