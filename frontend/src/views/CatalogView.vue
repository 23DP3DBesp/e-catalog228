<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, SlidersHorizontal, X, LayoutGrid, List, ArrowDown, Info, RotateCcw } from '@lucide/vue'
import CatalogFilters from '../components/catalog/CatalogFilters.vue'
import ProductCard from '../components/catalog/ProductCard.vue'
import UiButton from '../components/ui/UiButton.vue'
import UiSkeleton from '../components/ui/UiSkeleton.vue'
import { getCatalogProducts } from '../services/mock/catalog'
import { readFilters, writeFilters, filterProducts, activeFilters, defaults } from '../utils/catalogFilters'
import { compatibilityNotice } from '../data/vehicles'
import { addToCart } from '../stores/cart'

const route = useRoute()
const router = useRouter()
const products = ref([])
const loading = ref(true)
const error = ref(false)
const filters = computed(() => readFilters(route.query))
const filtered = computed(() => filterProducts(products.value, filters.value))
const chips = computed(() => activeFilters(filters.value))
const pageSize = 6
const limit = ref(pageSize)
watch(() => route.query, () => { limit.value = pageSize })
const visible = computed(() => filtered.value.slice(0,limit.value))
const drawer = ref(null)
const filterToggle = ref(null)
const drawerOpen = ref(false)
const feedback = ref('')
const addedId = ref(null)
let feedbackTimer
let alive = true
async function loadProducts() {
  loading.value = true
  error.value = false
  try { const data = await getCatalogProducts(); if (alive) products.value = data }
  catch { if (alive) error.value = true }
  finally { if (alive) loading.value = false }
}
function update(patch) {
  limit.value = pageSize
  router.replace({ query: writeFilters({ ...filters.value, ...patch }, route.query.vehicle) })
}
function clearFilters() {
  limit.value = pageSize
  router.replace({ query: writeFilters({ ...defaults, brands: [], view: filters.value.view }, route.query.vehicle) })
}
function removeChip(chip) {
  update({ [chip.key]: chip.key === 'brands' ? filters.value.brands.filter(b => b !== chip.value) : defaults[chip.key] })
}
function openFilters() {
  drawer.value.showModal()
  drawerOpen.value = true
  document.body.classList.add('catalog-filters-open')
}
function closeFilters() { drawer.value?.close() }
function afterClose() {
  drawerOpen.value = false
  document.body.classList.remove('catalog-filters-open')
  filterToggle.value?.focus()
}
function addProduct(product) {
  if (!product.available) return
  try {
    addToCart(product)
    addedId.value = product.id
    feedback.value = `${product.brand} ${product.model} pievienota grozam.`
  } catch {
    feedback.value = 'Neizdevās saglabāt grozu. Pārbaudiet pārlūka krātuves iestatījumus un mēģiniet vēlreiz.'
  }
  clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => { feedback.value = ''; addedId.value = null }, 4000)
}
onMounted(loadProducts)
onBeforeUnmount(() => {
  alive = false
  clearTimeout(feedbackTimer)
  document.body.classList.remove('catalog-filters-open')
})
</script>
<template>
  <main class="container catalog-page">
    <nav class="breadcrumbs" aria-label="Atrašanās vieta"><RouterLink to="/">Sākums</RouterLink><span aria-hidden="true">/</span><span>Riepu katalogs</span></nav>
    <header class="catalog-heading"><div><p class="section-kicker">Atrodi savu nākamo komplektu</p><h1>Riepu katalogs</h1><p>Izmērs, sezona, tavs budžets. Izvēle sākas ar to, kas svarīgs tev.</p></div><span class="catalog-edition">DEMO KOLEKCIJA / 01</span></header>
    <p class="catalog-demo"><Info :size="18" aria-hidden="true" /><span>Cenas, pieejamība, marķējuma vērtības un popularitāte ir demonstrācijas dati, nevis pārbaudīti ražotāju vai veikalu piedāvājumi. Attēli ir ilustratīvi.</span></p>
    <p v-if="route.query.vehicle === 'demo'" class="demo-notice">{{ compatibilityNotice }}</p>
    <div class="catalog-layout">
      <aside class="desktop-filters" aria-label="Riepu filtri"><div class="filter-heading"><h2>Filtri</h2><button v-if="chips.length" type="button" @click="clearFilters">Notīrīt</button></div><CatalogFilters :filters="filters" :products="products" @change="update" /></aside>
      <section class="catalog-results" aria-label="Meklēšanas rezultāti">
        <div class="catalog-toolbar"><label class="catalog-search"><Search :size="19" aria-hidden="true" /><span class="visually-hidden">Meklēt riepas</span><input type="search" :value="filters.q" placeholder="Ražotājs, modelis vai izmērs" @input="update({q:$event.target.value})" /></label><label class="sort-control"><span class="visually-hidden">Kārtot riepas</span><select :value="filters.sort" @change="update({sort:$event.target.value})"><option value="featured">Sākotnējā secība</option><option value="price-low">Cena: no zemākās</option><option value="price-high">Cena: no augstākās</option><option value="brand">Ražotājs</option><option value="popular">Popularitāte (demo)</option></select></label></div>
        <div class="results-bar"><button ref="filterToggle" class="mobile-filter-button" type="button" aria-controls="catalog-filter-dialog" :aria-expanded="drawerOpen" @click="openFilters"><SlidersHorizontal :size="16" aria-hidden="true" />Filtri<span v-if="chips.length">{{ chips.length }}</span></button><p role="status">{{ loading ? 'Ielādē riepas…' : error ? 'Katalogs nav pieejams' : `Atrasto modeļu skaits: ${filtered.length}` }}</p><div class="view-toggle" role="group" aria-label="Kataloga skats"><button type="button" aria-label="Režģa skats" :aria-pressed="filters.view === 'grid'" @click="update({view:'grid'})"><LayoutGrid :size="18" aria-hidden="true" /></button><button type="button" aria-label="Saraksta skats" :aria-pressed="filters.view === 'list'" @click="update({view:'list'})"><List :size="20" aria-hidden="true" /></button></div></div>
        <div v-if="chips.length" class="active-filters" aria-label="Aktīvie filtri"><button v-for="chip in chips" :key="chip.key + (chip.value || '')" type="button" :aria-label="`Noņemt filtru: ${chip.label}`" @click="removeChip(chip)">{{ chip.label }}<X :size="13" aria-hidden="true" /></button><button class="reset-all" type="button" @click="clearFilters">Notīrīt visus</button></div>
        <div v-if="loading" class="catalog-products" aria-busy="true" aria-label="Ielādē katalogu"><div v-for="index in 6" :key="index" class="skeleton-card"><UiSkeleton class="skeleton-image" /><UiSkeleton /><UiSkeleton /></div></div>
        <section v-else-if="error" class="catalog-empty" role="alert"><RotateCcw :size="32" aria-hidden="true" /><h2>Neizdevās ielādēt katalogu</h2><p>Lūdzu, mēģini vēlreiz.</p><UiButton @click="loadProducts">Mēģināt vēlreiz</UiButton></section>
        <template v-else-if="filtered.length"><div class="catalog-products" :class="{'is-list':filters.view === 'list'}"><ProductCard v-for="product in visible" :key="product.id" :product="product" :list="filters.view === 'list'" :added="addedId === product.id" @add="addProduct" /></div><div class="load-more"><p>Parādīti {{ visible.length }} no {{ filtered.length }} modeļiem</p><UiButton v-if="visible.length < filtered.length" variant="secondary" @click="limit += pageSize">Rādīt vēl<ArrowDown :size="16" aria-hidden="true" /></UiButton></div></template>
        <section v-else class="catalog-empty"><Search :size="32" aria-hidden="true" /><h2>Riepas nav atrastas</h2><p>Maini izmēru vai noņem kādu filtru, lai apskatītu citus modeļus.</p><UiButton @click="clearFilters">Notīrīt filtrus</UiButton></section>
      </section>
    </div>
    <dialog id="catalog-filter-dialog" ref="drawer" class="filter-dialog" aria-labelledby="filter-dialog-title" @close="afterClose" @click="event => {if(event.target === drawer) closeFilters()}"><div class="dialog-heading"><h2 id="filter-dialog-title">Riepu filtri</h2><button type="button" class="icon-button" aria-label="Aizvērt filtrus" autofocus @click="closeFilters"><X aria-hidden="true" /></button></div><CatalogFilters :filters="filters" :products="products" @change="update" /><div class="dialog-actions"><UiButton variant="secondary" @click="clearFilters">Notīrīt</UiButton><UiButton @click="closeFilters">Skatīt rezultātus ({{ filtered.length }})</UiButton></div></dialog>
    <div class="cart-feedback" :class="{visible: feedback}" role="status" aria-live="polite">{{ feedback }}</div>
  </main>
</template>
<style scoped>
.catalog-page { padding-block: 32px 80px; }.breadcrumbs { display: flex; gap: 12px; color: var(--color-secondary); font-size: 12px; }.breadcrumbs a:hover { color: var(--color-accent-hover); }.catalog-heading { display: flex; justify-content: space-between; gap: 24px; align-items: end; margin: 40px 0 28px; }.section-kicker { color: var(--color-accent-hover); font-size: 10px; letter-spacing: .14em; text-transform: uppercase; font-weight: 600; margin: 0 0 12px; }h1 { font-size: clamp(36px,4vw,52px); font-weight: 600; line-height: 1.1; letter-spacing: -.05em; margin: 0; }.catalog-heading div > p:last-child { margin: 16px 0 0; font-size: 14px; color: var(--color-secondary); }.catalog-edition { color: var(--color-secondary); font-size: 9px; letter-spacing: .12em; white-space: nowrap; }.catalog-demo { display: flex; align-items: start; gap: 12px; padding: 16px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; font-size: 12px; color: #52525b; margin: 0 0 32px; }.catalog-demo svg { flex-shrink: 0; margin-top: 2px; }.catalog-layout { display: grid; grid-template-columns: 240px minmax(0,1fr); gap: 40px; }.filter-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; min-height: 48px; }.filter-heading h2 { margin: 0; font-size: 18px; }.filter-heading button { border: 0; background: transparent; color: var(--color-accent-hover); font-size: 12px; min-height: 44px; }.catalog-results { min-width: 0; }.catalog-toolbar { display: grid; grid-template-columns: minmax(0,1fr) 210px; gap: 12px; }.catalog-search { border: 1px solid var(--color-border); border-radius: 12px; display: flex; align-items: center; gap: 8px; padding-inline: 16px; }.catalog-search svg { color: var(--color-secondary); flex-shrink: 0; }.catalog-search input { width: 100%; min-width: 0; border: 0; padding-inline: 4px; font-size: 13px; }.sort-control select { width: 100%; font-size: 12px; }.results-bar { display: flex; align-items: center; gap: 12px; margin-block: 20px; }.results-bar p { color: var(--color-secondary); font-size: 12px; margin: 0; }.view-toggle { margin-left: auto; display: flex; border: 1px solid var(--color-border); border-radius: 10px; padding: 3px; }.view-toggle button { width: 38px; height: 36px; display: grid; place-items: center; border: 0; background: transparent; border-radius: 7px; color: var(--color-secondary); }.view-toggle button[aria-pressed=true] { color: var(--color-text); background: #f1f2f4; }.active-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }.active-filters button { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--color-border); background: var(--color-surface); color: #52525b; border-radius: 8px; padding: 8px 10px; font-size: 11px; min-height: 36px; max-width: 100%; overflow-wrap: anywhere; }.active-filters .reset-all { background: transparent; border-color: transparent; color: var(--color-accent-hover); }.catalog-products { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; }.catalog-products.is-list { grid-template-columns: 1fr; }.load-more { text-align: center; padding-top: 32px; }.load-more p { color: var(--color-secondary); font-size: 12px; margin-bottom: 16px; }.catalog-empty { padding: 64px 24px; text-align: center; border: 1px dashed var(--color-border); border-radius: 16px; }.catalog-empty > svg { color: var(--color-secondary); }.catalog-empty h2 { font-size: 24px; letter-spacing: -.6px; }.catalog-empty p { color: var(--color-secondary); font-size: 14px; }.skeleton-card { display: grid; gap: 20px; border: 1px solid var(--color-border); border-radius: 16px; padding: 20px; }.skeleton-image { height: 200px; }.mobile-filter-button { display: none; }.filter-dialog { position: fixed; inset: 0 0 0 auto; width: min(420px,100%); height: 100dvh; max-height: 100dvh; max-width: 100%; margin: 0; border: 0; padding: 24px; background: white; color: var(--color-text); }.filter-dialog::backdrop { background: #11111155; }.dialog-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }.dialog-heading h2 { font-size: 22px; margin: 0; }.dialog-actions { position: sticky; bottom: -24px; background: white; padding-block: 16px; display: flex; gap: 8px; border-top: 1px solid var(--color-border); }.dialog-actions button { padding-inline: 12px; font-size: 12px; flex: 1; }.cart-feedback { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 15; max-width: min(500px,calc(100% - 32px)); width: max-content; padding: 0; background: #18181b; color: white; border-radius: 12px; font-size: 13px; pointer-events: none; }.cart-feedback.visible { padding: 16px 24px; }
:global(body.catalog-filters-open) { overflow: hidden; }
@media(max-width: 1200px) { .catalog-products { grid-template-columns: repeat(2,minmax(0,1fr)); }.catalog-layout { gap: 24px; } }
@media(max-width: 900px) { .desktop-filters { display: none; }.catalog-layout { grid-template-columns: 1fr; }.mobile-filter-button { display: flex; align-items: center; gap: 8px; background: white; border: 1px solid var(--color-border); border-radius: 10px; min-height: 44px; padding: 8px 12px; font-size: 12px; }.catalog-edition { display: none; } }
@media(max-width: 600px) { .catalog-page { padding-top: 24px; }.catalog-heading { margin-top: 28px; }.catalog-toolbar { grid-template-columns: 1fr; }.catalog-products { grid-template-columns: 1fr; }.results-bar { flex-wrap: wrap; }.results-bar p { font-size: 10px; }.view-toggle button { width: 32px; }.catalog-demo { font-size: 11px; }.catalog-empty { padding: 40px 16px; } }
</style>
