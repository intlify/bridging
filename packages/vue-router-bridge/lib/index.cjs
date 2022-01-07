var VueRouter = require('vue-router') // eslint-disable-line @typescript-eslint/no-var-requires

Object.keys(VueRouter).forEach(function (key) {
  exports[key] = VueRouter[key]
})

// dummy vue-router 3 class
class VueRouter3 {}

exports.default = VueRouter3
exports.isVueRouter3 = false
exports.isVueRouter4 = true
