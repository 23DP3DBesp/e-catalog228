import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import CartView from '../views/CartView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import CheckoutSuccessView from '../views/CheckoutSuccessView.vue'
import CatalogView from '../views/CatalogView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import AboutView from '../views/AboutView.vue'
import ProfileView from '../views/ProfileView.vue'
import OrderDetailView from '../views/OrderDetailView.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import AdminProducts from '../views/admin/AdminProducts.vue'
import AdminUsers from '../views/admin/AdminUsers.vue'
import AdminOrders from '../views/admin/AdminOrders.vue'
import { isLoggedIn, isAdmin } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: AboutView },

    // Auth
    { path: '/login', name: 'login', component: LoginView, meta: { guest: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guest: true } },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView, meta: { guest: true } },
    { path: '/reset-password', name: 'reset-password', component: ResetPasswordView },

    // Shop
    { path: '/catalog', name: 'catalog', component: CatalogView },
    { path: '/catalog/:id', name: 'product-details', component: ProductDetailView, props: true },
    { path: '/cart', name: 'cart', component: CartView },
    { path: '/checkout', name: 'checkout', component: CheckoutView },
    { path: '/checkout/success', name: 'checkout-success', component: CheckoutSuccessView },

    // Account
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/orders/:id', name: 'order-details', component: OrderDetailView, props: true, meta: { requiresAuth: true } },

    // Admin
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAdmin: true },
      children: [
        { path: '', name: 'admin', component: AdminProducts },
        { path: 'users', name: 'admin-users', component: AdminUsers },
        { path: 'orders', name: 'admin-orders', component: AdminOrders },
      ],
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.guest && isLoggedIn.value) return '/catalog'

  if ((to.meta.requiresAuth || to.meta.requiresAdmin) && !isLoggedIn.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !isAdmin.value) return '/'
})

export default router