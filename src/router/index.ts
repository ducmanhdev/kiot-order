import {createRouter, createWebHistory} from 'vue-router'
import {useOrderStore} from "@/stores/order";
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/login",
            name: "login",
            component: () => import("@/views/Login.vue"),
        },
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/Home.vue'),
            beforeEnter() {
                const orderStore = useOrderStore();
                orderStore.clearCart();
            }
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
        {
            path: "/:catchAll(.*)",
            name: "not-found",
            redirect: {
                name: 'home'
            }
        },
    ]
})

// router.beforeEach((to) => {
//     const orderStore = useOrderStore();
//     if (!orderStore.orderType && to.name !== 'home') return {name: 'home'}
// })



router.beforeEach((to: any) => {
    const authStore = useAuthStore();
    const accessToken = localStorage.getItem('accessToken') || authStore.accessToken;
    if (!accessToken && to.name !== 'login') return {name: "login"};
    if (accessToken && to.name === 'login') return {name: "home"};
  });
export default router;
