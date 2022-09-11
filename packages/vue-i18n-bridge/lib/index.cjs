Object.defineProperty(exports, '__esModule', {
  value: true
})

var VueI18n = require('vue-i18n')

Object.keys(VueI18n).forEach(function (key) {
  exports[key] = VueI18n[key]
})

// stub vue-i18n 8 class
class VueI18nLegacy {
  static install() {}
  static version = ''
}

exports.default = VueI18nLegacy
exports.isVueI18n8 = false
exports.isVueI18n9 = true
