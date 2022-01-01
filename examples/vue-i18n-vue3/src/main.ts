import { createApp } from 'vue'
import App from './App.vue'
import { createI18n } from '@intlify/vue-i18n-bridge'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      done: 'You did it!'
    }
  }
})

createApp(App).use(i18n).mount('#app')
