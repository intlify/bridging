import Vue from 'vue'
import { default as VueRouter, isVueRouter3 } from '@intlify/vue-router-bridge'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

console.log('isVueRouter3', isVueRouter3)

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
