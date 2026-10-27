import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../services/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.path === from.path) return false
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/cart',
      name: 'cart',
      meta: { requiresAuth: true },
      component: () => import('../views/CartView.vue'),
    },
    {
      path: '/favorites',
      name: 'favorites',
      meta: { requiresAuth: true },
      component: () => import('../views/FavoritesView.vue'),
    },
    {
      path: '/compare',
      name: 'compare',
      meta: { requiresAuth: true },
      component: () => import('../views/CompareView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      meta: { requiresAuth: true },
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/product/:id',
      name: 'product',
      component: () => import('../views/ProductView.vue'),
    },
    {
      path: '/catalog',
      name: 'catalog',
      component: () => import('../views/CatalogView.vue'),
    },
    {
      path: '/assistant',
      name: 'assistant',
      component: () => import('../views/TireFinderView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if ((to.name === 'login' || to.name === 'register') && isAuthenticated.value) return { name: 'profile' }
})

export default router
