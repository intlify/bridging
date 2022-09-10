function getPackageDeps(isVue2, isVue27) {
  // TODO:
  // prettier-ignore
  return isVue27
    ? 'vue@2.7'
    : isVue2
      ? `vue@2.6 @vue/composition-api`
      : 'vue@3'
}

function test(params) {
  // TODO: test should be written in here
  console.log('vue-router-bridge test')
  return true
}

module.exports = {
  getPackageDeps,
  test
}
