'use strict'

const vm = require('./vm.js')
const program = require('./program.js')

/*    understand/
 * the default entry point - starts the avatar virtual machine
 */
function start(log, store) {
  vm.start(log, store, program)
}

module.exports = {
  start,
}
