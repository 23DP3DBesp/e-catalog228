<script setup>
import SiteHeader from './components/layout/SiteHeader.vue'
import SiteFooter from './components/layout/SiteFooter.vue'
</script>
<template>
  <a class="skip-link" href="#main-content">Pāriet uz saturu</a>
  <SiteHeader />
  <div id="main-content" class="page-content" tabindex="-1"><RouterView /></div>
  <SiteFooter />
</template>
