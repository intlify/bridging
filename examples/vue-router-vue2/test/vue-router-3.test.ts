import { default as VueRouter, isVueRouter3, isVueRouter4, createRouter } from '@intlify/vue-router-bridge'

test('vue-router-bridge for vue2', () => {
  assert.ok(VueRouter)
  assert.ok(isVueRouter3)
  assert.ok(!isVueRouter4)
  assert.ok(createRouter) // check wheater it is exported
})
