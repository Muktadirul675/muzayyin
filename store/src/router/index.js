import HomeView from '@/views/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'HomeView',
      component: HomeView,
      meta: { keepAlive: true },
    },
    {
      path: '/category/:slug',
      name: 'category',
      component: () => import('@/views/Category.vue'), // lazy load
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/Cart.vue'), // lazy load
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/Checkout.vue'), // lazy load
    },
    {
      path: '/product/:slug',
      name: 'product',
      component: () => import('@/views/Product.vue'), // lazy load
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/About.vue'), // lazy load
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/ContactUs.vue'), // lazy load
    },
    {
      path: '/return-and-refunds',
      name: 'return-and-refunds',
      component: () => import('@/views/ReturnPolicy.vue'), // lazy load
    },
    {
      path: '/terms-and-conditions',
      name: 'terms-and-conditions',
      component: () => import('@/views/TermsAndConditions.vue'), // lazy load
    },
  ],
})

export default router