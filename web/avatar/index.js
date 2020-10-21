'use strict'

const vm = require('./vm.js')
const program = require('./program.js')

function start(log, store) {
  vm.start(log, store, program)
}

module.exports = {
  start,
}
