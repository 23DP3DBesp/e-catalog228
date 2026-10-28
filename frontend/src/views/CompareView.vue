<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { Scale, ShoppingBag, X } from '@lucide/vue'
import { getCatalogProducts } from '../services/catalog'
import { getCompared, toggleCompared, clearCompared } from '../stores/selection'
import { addProductWithBestOffer } from '../services/cartactions'
import { formatPrice } from '../utils/format'

const products = ref([])
const ids = ref(getCompared())
const message = ref('')
const loading = ref(true)

// Keep the order the user added the tires in
const compared = computed(() => ids.value.map(id => products.value.find(p => p.id === id)).filter(Boolean))

function refresh() { ids.value = getCompared() }
function remove(product) { toggleCompared(product.id) }

async function addProduct(product) {
  if (!product.available) return
  try {
    const result = await addProductWithBestOffer(product)
    message.value = result.ok
      ? `${product.brand} ${product.model} pievienota grozam (${result.offer.merchant}).`
      : 'Šai riepai šobrīd nav pieejamu piedāvājumu, ko var pasūtīt.'
  } catch {
    message.value = 'Neizdevās pievienot grozam. Pārbaudi savienojumu un mēģini vēlreiz.'
  }
}

const show = value => (value === null || value === undefined || value === '' ? '—' : value)

// Best value in a row: lowest number, or best (earliest) label letter. Ignores missing values.
function bestIds(getValue, kind) {
  const rows = compared.value.map(p => ({ id: p.id, value: getValue(p) })).filter(r => r.value !== null && r.value !== undefined && r.value !== '')
  if (rows.length < 2) return []
  const best = rows.reduce((a, b) => (kind === 'number' ? (b.value < a.value ? b : a) : (String(b.value) < String(a.value) ? b : a)))
  return rows.filter(r => r.value === best.value).map(r => r.id)
}

const rows = computed(() => [
  { label: 'Cena no', value: p => formatPrice(p.price), best: bestIds(p => p.price, 'number') },
  { label: 'Izmērs', value: p => show(p.size) },
  { label: 'Sezona', value: p => show(p.seasonLabel || p.season) },
  { label: 'Slodzes indekss', value: p => show(p.loadIndex) },
  { label: 'Ātruma indekss', value: p => show(p.speedIndex) },
  { label: 'Degvielas efektivitāte', value: p => show(p.fuel), best: bestIds(p => p.fuel, 'letter') },
  { label: 'Saķere uz slapja seguma', value: p => show(p.wet), best: bestIds(p => p.wet, 'letter') },
  { label: 'Trokšņa līmenis', value: p => (p.noise ? `${p.noise} dB` : '—'), best: bestIds(p => p.noise, 'number') },
  { label: 'Pieejamība', value: p => (p.available ? 'Pieejama' : 'Nav pieejama') },
])

onMounted(async () => {
  window.addEventListener('ecatalog:selection-updated', refresh)
  try { products.value = await getCatalogProducts() } catch { message.value = 'Neizdevās ielādēt riepas. Pārbaudi savienojumu un mēģini vēlreiz.' }
  loading.value = false
})
onBeforeUnmount(() => window.removeEventListener('ecatalog:selection-updated', refresh))
</script>

<template>
  <main class="container selection-page">
    <nav class="breadcrumbs" aria-label="Atrašanās vieta"><RouterLink to="/">Sākums</RouterLink><span aria-hidden="true">/</span><span>Salīdzinājums</span></nav>
    <header class="selection-heading">
      <div><p class="section-kicker">Līdz 4 riepām</p><h1>Salīdzinājums</h1><p>Salīdzini riepu īpašības un cenas vienuviet.</p></div>
      <div class="heading-actions">
        <button v-if="compared.length" type="button" class="text-link" @click="clearCompared">Notīrīt visu</button>
        <RouterLink class="text-link" to="/catalog">Atvērt katalogu <span aria-hidden="true">→</span></RouterLink>
      </div>
    </header>
    <p v-if="message" role="status" style="margin:0 0 16px;font-size:13px">{{ message }}</p>

    <div v-if="compared.length" class="table-wrap">
      <table class="compare-table">
        <caption class="sr-only">Izvēlēto riepu salīdzinājums</caption>
        <thead>
          <tr>
            <th scope="col"><span class="sr-only">Īpašība</span></th>
            <th v-for="product in compared" :key="product.id" scope="col">
              <button type="button" class="remove" :aria-label="`Noņemt ${product.brand} ${product.model} no salīdzinājuma`" @click="remove(product)"><X :size="16" aria-hidden="true" /></button>
              <RouterLink :to="{ name: 'product', params: { id: product.id } }" class="product-name"><span>{{ product.brand }}</span>{{ product.model }}</RouterLink>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.label">
            <th scope="row">{{ row.label }}</th>
            <td v-for="product in compared" :key="product.id" :class="{ best: row.best?.includes(product.id) }">{{ row.value(product) }}</td>
          </tr>
          <tr>
            <th scope="row"><span class="sr-only">Darbības</span></th>
            <td v-for="product in compared" :key="product.id">
              <button type="button" class="add" :disabled="!product.available" @click="addProduct(product)"><ShoppingBag :size="16" aria-hidden="true" />Pievienot grozam</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="legend">Zaļā krāsā izcelta labākā vērtība rindā. Dati ir demonstrācijas dati.</p>
    </div>

    <section v-else-if="!loading" class="empty-state">
      <Scale :size="28" aria-hidden="true" />
      <h2>Salīdzinājums pagaidām ir tukšs</h2>
      <p>Katalogā nospied svaru ikonu pie riepas, lai pievienotu to salīdzināšanai.</p>
      <RouterLink class="primary-link" to="/catalog"><ShoppingBag :size="17" aria-hidden="true" />Apskatīt riepas</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.selection-page{padding-block:32px 80px}
.breadcrumbs{display:flex;gap:12px;color:var(--color-secondary);font-size:12px}
.selection-heading{display:flex;align-items:end;justify-content:space-between;gap:24px;margin:40px 0 28px}
.section-kicker{margin:0 0 10px;color:var(--color-accent-hover);font-size:10px;letter-spacing:.14em;text-transform:uppercase}
.selection-heading h1{margin:0;font-size:clamp(36px,4vw,52px);letter-spacing:-.05em}
.selection-heading p:last-child{margin:12px 0 0;color:var(--color-secondary);font-size:14px}
.heading-actions{display:flex;gap:20px;align-items:center}
.text-link,.primary-link{display:inline-flex;align-items:center;gap:8px;min-height:44px;font-size:13px;font-weight:600;background:none;border:0;cursor:pointer;color:inherit;font-family:inherit}
.table-wrap{overflow-x:auto;border:1px solid var(--color-border);border-radius:16px}
.compare-table{width:100%;min-width:640px;border-collapse:collapse;font-size:14px}
.compare-table th,.compare-table td{padding:16px 20px;text-align:left;border-bottom:1px solid var(--color-border);vertical-align:top}
.compare-table tbody tr:last-child th,.compare-table tbody tr:last-child td{border-bottom:0}
.compare-table tbody th{color:var(--color-secondary);font-weight:500;font-size:13px;white-space:nowrap}
.compare-table thead th{position:relative;padding-top:28px}
.product-name{display:block;font-size:16px;font-weight:600;letter-spacing:-.02em}
.product-name span{display:block;margin-bottom:4px;color:var(--color-secondary);font-size:12px;font-weight:500}
.remove{position:absolute;top:6px;right:8px;display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:6px;background:none;color:var(--color-secondary);cursor:pointer}
.remove:hover{color:var(--color-text)}
td.best{color:#15803d;font-weight:600}
.add{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 14px;border:0;border-radius:8px;background:var(--color-accent);color:white;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
.add:disabled{opacity:.45;cursor:not-allowed}
.legend{margin:0;padding:12px 20px;color:var(--color-secondary);font-size:12px}
.empty-state{min-height:360px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;border:1px solid var(--color-border);border-radius:16px;color:var(--color-secondary)}
.empty-state h2{margin:20px 0 8px;color:var(--color-text);font-size:22px}
.empty-state p{margin:0 0 20px;font-size:14px}
.primary-link{padding:0 16px;border-radius:8px;background:var(--color-accent);color:white}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media(max-width:600px){.selection-heading{align-items:start;flex-direction:column}}
</style>
