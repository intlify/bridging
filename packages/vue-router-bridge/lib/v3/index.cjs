var VueRouter = require('vue-router') // eslint-disable-line @typescript-eslint/no-var-requires
var VueDemi = require('vue-demi') // eslint-disable-line @typescript-eslint/no-var-requires

const useRouter = () => {
  const instance = VueDemi.getCurrentInstance()
  if (instance == null) {
    throw new Error(`should be used in setup`)
  }
  const vm = instance.proxy || instance
  return vm.$router
}

const useRoute = () => {
  const instance = VueDemi.getCurrentInstance()
  if (instance == null) {
    throw new Error(`should be used in setup`)
  }
  const vm = instance.proxy || instance
  return VueDemi.reactive(vm.$route)
}

exports.useRouter = useRouter
exports.useRoute = useRoute
exports.isVueRouter3 = true
exports.isVueRouter4 = false

/**
 * shim vue-router@4 typings
 */
const STUB = () => ({})
exports.createRouter = STUB
exports.createMemoryHistory = STUB
exports.createRouterMatcher = STUB
exports.createWebHashHistory = STUB
exports.createWebHistory = STUB

module.exports = VueRouter
