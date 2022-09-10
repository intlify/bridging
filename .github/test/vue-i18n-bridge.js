function getPackageDeps(isVue2, isVue27) {
  // prettier-ignore
  return isVue27
    ? 'vue@2.7 vue-i18n@8 vue-i18n-bridge@9'
    : isVue2
      ? `vue@2.6 @vue/composition-api vue-i18n@8 vue-i18n-bridge@9`
      : 'vue@3 vue-i18n@9'
}

function test(params) {
  // TODO: test should be written in here
  console.log('vue-i18n-bridge test')
  return true
}

module.exports = {
  getPackageDeps,
  test
}
