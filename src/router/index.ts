import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: HomeView
    // },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/order/:categoryId?',
      name: 'order',
      component: () => import('@/views/order/Order.vue')
    },
    {
      path: '/overview',
      name: 'overview',
      component: () => import('@/views/checkout/Overview.vue')
    },
    {
      path: '/payment-method',
      name: 'payment-method',
      component: () => import('@/views/checkout/PaymentMethod.vue')
    },
  ]
})

export default router
