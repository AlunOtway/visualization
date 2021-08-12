import Vue from 'vue'
import VueRouter from 'vue-router'
import ScreenPage from '@/views/ScreenPage'
Vue.use(VueRouter)

const routes = [
  {
    path: '/screen',
    component: ScreenPage
  },
  {
    path: '/',
    redirect: '/screen'
  }
]

const router = new VueRouter({
  routes
})

export default router
