var VueI18n = require('vue-i18n')

Object.keys(VueI18n).forEach(function (key) {
  exports[key] = VueI18n[key]
})

exports.default = undefined
exports.isVueI18n8 = false
exports.isVueI18n9 = true
