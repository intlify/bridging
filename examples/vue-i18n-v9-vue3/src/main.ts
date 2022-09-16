import { createApp } from 'vue'
import App from './App.vue'
import { createI18n, isVueI18n8 } from '@intlify/vue-i18n-bridge'

console.log('isVueI18n8', isVueI18n8)

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      done: 'You did it!'
    }
  }
})

createApp(App).use(i18n).mount('#app')
