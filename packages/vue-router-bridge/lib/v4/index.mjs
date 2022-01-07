import { useRouter, useRoute } from 'vue-router'

var isVueRouter3 = false
var isVueRouter4 = true

// dummy vue-router 3 class
class VueRouter3 {}

export * from 'vue-router'
export { useRouter, useRoute, isVueRouter3, isVueRouter4 }

export default VueRouter3
