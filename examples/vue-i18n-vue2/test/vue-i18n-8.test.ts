import { default as VueI18n, isVueI18n8, isVueI18n9 } from '@intlify/vue-i18n-bridge'

test('vue-i18n-bridge for vue2', () => {
  assert.ok(VueI18n)
  assert.ok(isVueI18n8)
  assert.ok(!isVueI18n9)
})
