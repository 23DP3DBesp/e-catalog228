<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { ArrowUpRight, Heart, Scale, X } from '@lucide/vue'
import { products } from '../data/products'
const imageBase = import.meta.env.BASE_URL
import { clearCompared, getCompared, hasFavorite, toggleFavorite, toggleCompared } from '../stores/selection'
import { formatPrice } from '../utils/format'

const ids = ref(getCompared())
const compared = computed(() => products.filter(product => ids.value.includes(product.id)))
const rows = computed(() => [
  { label: 'Ražotājs', value: product => product.brand },
  { label: 'Modelis', value: product => product.model },
  { label: 'Izmērs', value: product => product.size },
  { label: 'Sezona', value: product => product.seasonLabel },
  { label: 'Slodzes un ātruma indekss', value: product => `${product.loadIndex}${product.speedIndex}` },
  { label: 'Piemēra cena par riepu', value: product => formatPrice(product.price) },
  { label: 'Degvielas efektivitāte', value: product => product.fuel || 'Nav datu' },
  { label: 'Saķere uz slapja ceļa', value: product => product.wet || 'Nav datu' },
  { label: 'Ārējais troksnis', value: product => product.noise == null ? 'Nav datu' : `${product.noise} dB` },
  { label: 'Ziemas marķējums', value: product => product.markings.length ? product.markings.join(', ') : 'Nav norādīts' },
])
const favoriteIds = ref([])
function refresh() { ids.value = getCompared(); favoriteIds.value = products.filter(product => hasFavorite(product.id)).map(product => product.id) }
function remove(id) { toggleCompared(id) }
function clear() { clearCompared() }
function favorite(id) { toggleFavorite(id); refresh() }
onMounted(() => { refresh(); window.addEventListener('ecatalog:selection-updated', refresh) })
onBeforeUnmount(() => window.removeEventListener('ecatalog:selection-updated', refresh))
</script>

<template>
  <main class="container compare-page">
    <nav class="breadcrumbs" aria-label="Atrašanās vieta"><RouterLink to="/">Sākums</RouterLink><span aria-hidden="true">/</span><span>Salīdzinājums</span></nav>
    <header class="compare-heading"><div><p class="section-kicker">Apskati blakus</p><h1>Salīdzināt riepas</h1><p>Izvēlies līdz 4 modeļiem, lai salīdzinātu to īpašības.</p></div><button v-if="compared.length" type="button" class="clear-button" @click="clear">Notīrīt</button></header>
    <section v-if="compared.length" class="comparison" aria-label="Riepu salīdzinājums">
      <div class="comparison-table" :style="{'--product-count': compared.length}">
        <div class="table-label table-top">Īpašības</div>
        <article v-for="product in compared" :key="product.id" class="product-column">
          <div class="product-image"><img :src="`${imageBase}${product.image}`" alt="" width="1254" height="1254" /><button type="button" :aria-label="`Noņemt ${product.model} no salīdzinājuma`" @click="remove(product.id)"><X :size="18" aria-hidden="true" /></button></div>
          <p class="product-brand">{{ product.brand }}</p><h2>{{ product.model }}</h2><div class="product-actions"><RouterLink :to="`/product/${product.id}`">Apskatīt <ArrowUpRight :size="15" aria-hidden="true" /></RouterLink><button type="button" :aria-pressed="favoriteIds.includes(product.id)" :aria-label="favoriteIds.includes(product.id) ? 'Noņemt no izlases' : 'Pievienot izlasei'" @click="favorite(product.id)"><Heart :size="17" aria-hidden="true" /></button></div>
        </article>
        <template v-for="row in rows" :key="row.label"><div class="table-label">{{ row.label }}</div><div v-for="product in compared" :key="`${row.label}-${product.id}`" class="table-value">{{ row.value(product) }}</div></template>
      </div>
      <p class="data-note">Cenas un marķējuma vērtības ir piemēri. Pārbaudi riepas īpašības pie ražotāja vai pārdevēja.</p>
    </section>
    <section v-else class="empty-state"><Scale :size="28" aria-hidden="true" /><h2>Vēl nav ko salīdzināt</h2><p>Katalogā nospied svaru ikonu pie riepām, kuras vēlies salīdzināt.</p><RouterLink class="primary-link" to="/catalog">Atvērt katalogu <ArrowUpRight :size="17" aria-hidden="true" /></RouterLink></section>
  </main>
</template>

<style scoped>
.compare-page{padding-block:32px 80px}.breadcrumbs{display:flex;gap:12px;color:var(--color-secondary);font-size:12px}.compare-heading{display:flex;align-items:end;justify-content:space-between;gap:24px;margin:40px 0 28px}.section-kicker{margin:0 0 10px;color:var(--color-accent-hover);font-size:10px;letter-spacing:.14em;text-transform:uppercase}.compare-heading h1{margin:0;font-size:clamp(36px,4vw,52px);letter-spacing:-.05em}.compare-heading p:last-child{margin:12px 0 0;color:var(--color-secondary);font-size:14px}.clear-button{min-height:44px;padding:0 14px;border:1px solid var(--color-border);border-radius:8px;background:white;font-size:12px}.comparison{overflow:hidden}.comparison-table{display:grid;grid-template-columns:minmax(150px,1.15fr) repeat(var(--product-count),minmax(180px,1fr));border:1px solid var(--color-border);border-radius:14px;overflow-x:auto}.table-label,.table-value{min-height:56px;padding:16px;border-top:1px solid var(--color-border);font-size:12px}.table-label{color:var(--color-secondary);font-weight:500}.table-top{border-top:0;align-self:end}.product-column{grid-row:span 1;min-width:0;padding:16px;border-left:1px solid var(--color-border)}.product-image{position:relative;background:#f8f9fa;border-radius:10px}.product-image img{display:block;width:100%;height:150px;object-fit:contain;padding:18px;mix-blend-mode:multiply}.product-image button,.product-actions button{display:grid;place-items:center;width:36px;height:36px;border:1px solid var(--color-border);border-radius:50%;background:white}.product-image button{position:absolute;right:8px;top:8px}.product-brand{margin:16px 0 6px;color:var(--color-secondary);font-size:10px;text-transform:uppercase;letter-spacing:.1em}.product-column h2{min-height:44px;margin:0;font-size:16px;line-height:1.35}.product-actions{display:flex;align-items:center;justify-content:space-between;margin-top:12px}.product-actions>a{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600}.product-actions button[aria-pressed=true]{color:var(--color-accent-hover)}.table-value{border-left:1px solid var(--color-border)}.data-note{margin:14px 0 0;color:var(--color-secondary);font-size:11px}.empty-state{min-height:360px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;border:1px solid var(--color-border);border-radius:16px;color:var(--color-secondary)}.empty-state h2{margin:20px 0 8px;color:var(--color-text);font-size:22px}.empty-state p{max-width:400px;margin:0 0 20px;font-size:14px}.primary-link{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 16px;border-radius:8px;background:var(--color-accent);color:white;font-size:13px;font-weight:600}@media(max-width:700px){.compare-heading{align-items:start}.comparison-table{grid-template-columns:minmax(120px,.8fr) repeat(var(--product-count),minmax(160px,1fr))}.product-image img{height:120px}.table-label,.table-value{padding:12px;font-size:11px}}
</style>
