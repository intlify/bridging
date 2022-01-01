var VueRouter = require('vue-router') // eslint-disable-line @typescript-eslint/no-var-requires

Object.keys(VueRouter).forEach(function (key) {
  exports[key] = VueRouter[key]
})

exports.default = undefined
exports.isVueRouter3 = false
exports.isVueRouter4 = true
