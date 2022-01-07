import { default as VueRouter, isVueRouter3, isVueRouter4 } from '@intlify/vue-router-bridge'

test('vue-router-bridge for vue3', () => {
  assert.isDefined(VueRouter)
  assert.ok(!isVueRouter3)
  assert.ok(isVueRouter4)
})
