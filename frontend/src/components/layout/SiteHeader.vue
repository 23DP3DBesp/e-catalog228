<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X, ShoppingBag, UserRound, CircleDot, ArrowUpRight } from '@lucide/vue'
import { getCartCount } from '../../stores/cart'

const route = useRoute()
const drawer = ref(null)
const toggle = ref(null)
const isOpen = ref(false)
const count = ref(getCartCount())
const links = [
  { to: '/', label: 'Sākums' },
  { to: '/catalog', label: 'Riepu katalogs' },
  { to: '/about', label: 'Par mums' },
]
function refreshCount() { count.value = getCartCount() }
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
})
onBeforeUnmount(() => {
  document.body.classList.remove('menu-open')
  window.removeEventListener('ecatalog:cart-updated', refreshCount)
  window.removeEventListener('storage', refreshCount)
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
        <RouterLink class="icon-button account-link" to="/login" aria-label="Pierakstīties"><UserRound :size="21" aria-hidden="true" /></RouterLink>
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
        <RouterLink to="/cart" @click="closeMenu">Grozs <span>{{ count }}</span></RouterLink>
        <RouterLink to="/login" @click="closeMenu">Pierakstīties<UserRound :size="20" aria-hidden="true" /></RouterLink>
      </nav>
      <p class="drawer-note">Pārdomāta riepu izvēle sākas šeit.</p>
    </dialog>
  </header>
</template>
