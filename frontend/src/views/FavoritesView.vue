<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { Heart, ShoppingBag } from '@lucide/vue'
import ProductCard from '../components/catalog/ProductCard.vue'
import { products } from '../data/products'
import { getFavorites } from '../stores/selection'
import { addToCart } from '../stores/cart'

const ids = ref(getFavorites())
const favorites = computed(() => products.filter(product => ids.value.includes(product.id)))
function refresh() { ids.value = getFavorites() }
function addProduct(product) { if (product.available) addToCart(product) }
onMounted(() => window.addEventListener('ecatalog:selection-updated', refresh))
onBeforeUnmount(() => window.removeEventListener('ecatalog:selection-updated', refresh))
</script>

<template>
  <main class="container selection-page">
    <nav class="breadcrumbs" aria-label="Atrašanās vieta"><RouterLink to="/">Sākums</RouterLink><span aria-hidden="true">/</span><span>Izlase</span></nav>
    <header class="selection-heading"><div><p class="section-kicker">Saglabātās riepas</p><h1>Izlase</h1><p>Riepas, kuras vēlies apskatīt vēlāk.</p></div><RouterLink class="text-link" to="/catalog">Atvērt katalogu <span aria-hidden="true">→</span></RouterLink></header>
    <section v-if="favorites.length" class="product-grid" aria-label="Izlases riepas">
      <ProductCard v-for="product in favorites" :key="product.id" :product="product" @add="addProduct" />
    </section>
    <section v-else class="empty-state"><Heart :size="28" aria-hidden="true" /><h2>Izlase pagaidām ir tukša</h2><p>Katalogā nospied sirsniņu, lai saglabātu riepu šeit.</p><RouterLink class="primary-link" to="/catalog"><ShoppingBag :size="17" aria-hidden="true" />Apskatīt riepas</RouterLink></section>
  </main>
</template>

<style scoped>
.selection-page{padding-block:32px 80px}.breadcrumbs{display:flex;gap:12px;color:var(--color-secondary);font-size:12px}.selection-heading{display:flex;align-items:end;justify-content:space-between;gap:24px;margin:40px 0 28px}.section-kicker{margin:0 0 10px;color:var(--color-accent-hover);font-size:10px;letter-spacing:.14em;text-transform:uppercase}.selection-heading h1{margin:0;font-size:clamp(36px,4vw,52px);letter-spacing:-.05em}.selection-heading p:last-child{margin:12px 0 0;color:var(--color-secondary);font-size:14px}.text-link,.primary-link{display:inline-flex;align-items:center;gap:8px;min-height:44px;font-size:13px;font-weight:600}.product-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.empty-state{min-height:360px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;border:1px solid var(--color-border);border-radius:16px;color:var(--color-secondary)}.empty-state h2{margin:20px 0 8px;color:var(--color-text);font-size:22px}.empty-state p{margin:0 0 20px;font-size:14px}.primary-link{padding:0 16px;border-radius:8px;background:var(--color-accent);color:white}@media(max-width:900px){.product-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.selection-heading{align-items:start;flex-direction:column}.product-grid{grid-template-columns:1fr}}
</style>
