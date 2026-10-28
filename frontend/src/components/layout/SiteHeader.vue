<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, X, ShoppingBag, UserRound, CircleDot, ArrowUpRight, Heart, Scale, LogOut, ShieldCheck } from '@lucide/vue'
import { getCartCount } from '../../stores/cart'
import { getFavorites, getCompared } from '../../stores/selection'
import { clearAuth, useAuth } from '../../services/auth.js'

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated, isAdmin } = useAuth()
const drawer = ref(null)
const toggle = ref(null)
const isOpen = ref(false)
const count = ref(getCartCount())
const favoriteCount = ref(getFavorites().length)
const compareCount = ref(getCompared().length)
const links = [
  { to: '/', label: 'Sākums' },
  { to: '/catalog', label: 'Riepu katalogs' },
  { to: '/assistant', label: 'Riepu izvēles palīgs' },
  { to: '/about', label: 'Par mums' },
]
function logOut() {
  clearAuth()
  closeMenu()
  router.push('/')
}
function refreshCount() {
  count.value = getCartCount()
  favoriteCount.value = getFavorites().length
  compareCount.value = getCompared().length
}
function openMenu() { drawer.value.showModal(); isOpen.value = true; document.body.classList.add('menu-open') }
function closeMenu() { drawer.value?.close() }
function onClose() {
  isOpen.value = false
  document.body.classList.remove('menu-open')
  toggle.value?.focus()
}
watch(() => route.fullPath, () => { closeMenu(); refreshCount() })
onMounted(() => {
  window.addEventListener('ecatalog:cart-updated', refreshCount)
  window.addEventListener('storage', refreshCount)
  window.addEventListener('ecatalog:selection-updated', refreshCount)
})
onBeforeUnmount(() => {
  document.body.classList.remove('menu-open')
  window.removeEventListener('ecatalog:cart-updated', refreshCount)
  window.removeEventListener('storage', refreshCount)
  window.removeEventListener('ecatalog:selection-updated', refreshCount)
})
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <RouterLink class="wordmark" to="/" aria-label="E-Catalog Tires — sākums">
        <CircleDot class="wordmark-icon" :size="30" aria-hidden="true" />
        <span>E-Catalog<span class="wordmark-sub">TIRES</span></span>
      </RouterLink>
      <nav class="desktop-nav" aria-label="Galvenā navigācija">
        <RouterLink v-for="link in links" :key="link.to" :to="link.to">{{ link.label }}</RouterLink>
      </nav>
      <div class="header-actions">
        <RouterLink class="icon-button selection-access" to="/favorites" :aria-label="`Izlase. Riepu skaits: ${favoriteCount}`"><Heart :size="20" aria-hidden="true" /><span v-if="favoriteCount" class="cart-badge">{{ favoriteCount }}</span></RouterLink>
        <RouterLink class="icon-button selection-access" to="/compare" :aria-label="`Salīdzinājums. Riepu skaits: ${compareCount}`"><Scale :size="20" aria-hidden="true" /><span v-if="compareCount" class="cart-badge">{{ compareCount }}</span></RouterLink>
        <RouterLink v-if="!isAuthenticated" class="icon-button account-link" to="/login" aria-label="Pierakstīties" title="Pierakstīties"><UserRound :size="21" aria-hidden="true" /></RouterLink>
        <div v-else class="signed-in-actions" :title="user?.email || 'Pierakstījies'">
          <RouterLink class="signed-in-name" to="/profile">{{ user?.displayName || user?.email }}</RouterLink>
          <RouterLink v-if="isAdmin" class="icon-button account-link" to="/admin" aria-label="Administrēšana" title="Administrēšana"><ShieldCheck :size="20" aria-hidden="true" /></RouterLink>
          <RouterLink class="icon-button account-link" to="/profile" aria-label="Mans profils" title="Mans profils"><UserRound :size="20" aria-hidden="true" /></RouterLink>
          <button class="icon-button logout-button" type="button" aria-label="Izrakstīties" title="Izrakstīties" @click="logOut"><LogOut :size="20" aria-hidden="true" /></button>
        </div>
        <RouterLink class="icon-button cart-access" to="/cart" :aria-label="`Grozs. Riepu skaits: ${count}`">
          <ShoppingBag :size="21" aria-hidden="true" /><span v-if="count" class="cart-badge">{{ count }}</span>
        </RouterLink>
        <button ref="toggle" class="icon-button menu-toggle" type="button" aria-label="Atvērt izvēlni" aria-controls="mobile-menu" :aria-expanded="isOpen" @click="openMenu"><Menu :size="23" aria-hidden="true" /></button>
      </div>
    </div>
    <dialog id="mobile-menu" ref="drawer" class="mobile-drawer" aria-labelledby="menu-title" @close="onClose" @click="event => { if (event.target === drawer) closeMenu() }">
      <div class="drawer-top"><strong id="menu-title">Izvēlne</strong><button class="icon-button" type="button" aria-label="Aizvērt izvēlni" autofocus @click="closeMenu"><X aria-hidden="true" /></button></div>
      <nav class="drawer-nav" aria-label="Mobilā navigācija">
        <RouterLink v-for="link in links" :key="link.to" :to="link.to" @click="closeMenu">{{ link.label }}<ArrowUpRight :size="20" aria-hidden="true" /></RouterLink>
        <RouterLink to="/favorites" @click="closeMenu">Izlase <span>{{ favoriteCount }}</span><Heart :size="20" aria-hidden="true" /></RouterLink>
        <RouterLink to="/compare" @click="closeMenu">Salīdzināt <span>{{ compareCount }}</span><Scale :size="20" aria-hidden="true" /></RouterLink>
        <RouterLink to="/cart" @click="closeMenu">Grozs <span>{{ count }}</span></RouterLink>
        <RouterLink v-if="!isAuthenticated" to="/login" @click="closeMenu">Pierakstīties<UserRound :size="20" aria-hidden="true" /></RouterLink>
        <div v-else class="drawer-auth-row">
          <RouterLink v-if="isAdmin" to="/admin" @click="closeMenu">Administrēšana</RouterLink>
          <RouterLink to="/profile" @click="closeMenu">Mans profils · {{ user?.displayName || user?.email }}</RouterLink>
          <button class="ui-button ui-button--secondary" type="button" @click="logOut"><LogOut :size="18" aria-hidden="true" /> Izrakstīties</button>
        </div>
      </nav>
      <p class="drawer-note">Pārdomāta riepu izvēle sākas šeit.</p>
    </dialog>
  </header>
</template>
