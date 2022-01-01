import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'
import { default as VueI18n, createI18n, castToVueI18n } from '@intlify/vue-i18n-bridge'

import App from './App.vue'

Vue.use(VueCompositionAPI)
Vue.use(VueI18n, { bridge: true })

const i18n = castToVueI18n(
  createI18n(
    {
      locale: 'en',
      messages: {
        en: {
          done: 'You did it!'
        }
      }
    },
    VueI18n
  )
)

Vue.use(i18n)

const app = new Vue({
  i18n,
  render: h => h(App)
})

app.$mount('#app')
