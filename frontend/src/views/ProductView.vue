<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Info, Fuel, Droplets, Volume2, ShoppingBag, Check, ShieldAlert, LoaderCircle } from '@lucide/vue'
import UiButton from '../components/ui/UiButton.vue'
import { getCatalogProducts } from '../services/catalog'
import { getProductOffers } from '../services/offers'
import { calculateOfferTotal } from '../utils/orderTotals'
import { formatPrice } from '../utils/format'
import { addToCart } from '../stores/cart'
import { useAuth } from '../services/auth.js'

const imageBase = import.meta.env.BASE_URL
const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()
const product = ref(null)
const offers = ref([])
const loading = ref(true)
const error = ref(false)
const quantity = ref(4)
const selectedOfferId = ref('')
const feedback = ref('')
let clearTimer
const sortedOffers = computed(() => [...offers.value].sort((a,b) => {
  const first = calculateOfferTotal(a, quantity.value).total
  const second = calculateOfferTotal(b, quantity.value).total
  if (first == null) return second == null ? a.price - b.price : 1
  if (second == null) return -1
  return first - second
}))
const selectedOffer = computed(() => offers.value.find(offer => offer.id === selectedOfferId.value) || sortedOffers.value[0])
const selectedTotal = computed(() => selectedOffer.value ? calculateOfferTotal(selectedOffer.value, quantity.value) : null)
const pricePerTire = computed(() => selectedOffer.value ? selectedOffer.value.price : 0)
async function load() {
  loading.value = true; error.value = false
  try {
    const products = await getCatalogProducts()
    const found = products.find(item => String(item.id) === String(route.params.id))
    if (!found) { error.value = true; return }
    product.value = found
    offers.value = await getProductOffers(found)
    selectedOfferId.value = offers.value[0]?.id || ''
  } catch { error.value = true }
  finally { loading.value = false }
}
watch(() => route.params.id, load)
function selectOffer(offer) { selectedOfferId.value = offer.id }
function addSelectedOffer() {
  if (!isAuthenticated.value) { router.push({ name: 'login', query: { redirect: '/cart' } }); return }
  const offer = selectedOffer.value
  if (!product.value || !offer) return
  try {
    addToCart({ ...product.value, price: offer.price, offerId: offer.id, merchantId: offer.merchantId, merchant: offer.merchant, shippingRule: offer.shipping, quantity: quantity.value })
    feedback.value = `${product.value.brand} ${product.value.model} (${quantity.value} gab.) no ${offer.merchant} pievienotas grozam.`
  } catch {
    feedback.value = 'Neizdevās saglabāt grozu. Pārbaudiet pārlūka krātuves iestatījumus un mēģiniet vēlreiz.'
  }
  clearTimeout(clearTimer)
  clearTimer = setTimeout(() => { feedback.value = '' }, 4500)
}
function eur(value) { return value === null ? 'Nav zināma' : formatPrice(value) }
onMounted(load)
onBeforeUnmount(() => clearTimeout(clearTimer))
</script>
<template>
  <main class="container product-page">
    <nav class="breadcrumbs" aria-label="Atrašanās vieta"><RouterLink to="/">Sākums</RouterLink><span aria-hidden="true">/</span><RouterLink to="/catalog">Riepu katalogs</RouterLink><span aria-hidden="true">/</span><span>{{ product?.model || 'Riepas' }}</span></nav>
    <div v-if="loading" class="product-state" aria-live="polite"><LoaderCircle class="spinner" :size="26" aria-hidden="true" />Ielādē riepas informāciju…</div>
    <section v-else-if="error || !product" class="product-state"><ShieldAlert :size="32" aria-hidden="true" /><h1>Šo riepu neizdevās atrast</h1><p>Pārbaudi, vai adrese ir pareiza, vai atgriezies katalogā.</p><UiButton @click="router.push('/catalog')"><ArrowLeft :size="17" aria-hidden="true" />Atgriezties katalogā</UiButton></section>
    <template v-else>
      <p class="demo-banner"><Info :size="18" aria-hidden="true" />Šeit redzamās cenas un parametri ir piemēri, nevis aktuāli veikalu dati.</p>
      <section class="product-hero"><div class="product-image"><span>Ilustratīvs attēls</span><img :src="`${imageBase}${product.image}`" alt="Neitrāla riepas ilustrācija" width="1254" height="1254" fetchpriority="high" /></div><div class="product-intro"><p class="product-brand">{{ product.brand }}</p><h1>{{ product.model }}</h1><p class="product-size">{{ product.size }} <span>· {{ product.loadIndex }}{{ product.speedIndex }}</span></p><span class="season-tag">{{ product.seasonLabel }}</span><div class="hero-price"><div><small>Zemākā piemēra cena / riepu</small><strong>{{ formatPrice(Math.min(...offers.map(offer => offer.price))) }}</strong></div><span>{{ offers.length }} piemēra piedāvājumi</span></div><div class="hero-buttons"><a class="hero-button primary" href="#offers">Salīdzināt piedāvājumus<ArrowRight :size="17" aria-hidden="true" /></a><RouterLink class="text-action" to="/catalog"><ArrowLeft :size="16" aria-hidden="true" />Atpakaļ uz katalogu</RouterLink></div><p class="price-note">Cena ir par vienu riepu. Piegāde aprēķināta atsevišķi.</p></div></section>
      <section class="product-details"><div class="detail-main"><div class="section-heading"><p class="section-kicker">Pamatinformācija</p><h2>Kas jāzina par šo modeli.</h2><p>Šeit redzami riepas izmērs un galvenie parametri.</p></div><div class="spec-grid"><div><span>Ražotājs</span><strong>{{ product.brand }}</strong></div><div><span>Modelis</span><strong>{{ product.model }}</strong></div><div><span>Platums</span><strong>{{ product.size.split('/')[0] }} mm</strong></div><div><span>Profils</span><strong>{{ product.size.split('/')[1]?.split(' ')[0] }}%</strong></div><div><span>Diametrs</span><strong>{{ product.size.split('R')[1] }}</strong></div><div><span>Slodzes indekss</span><strong>{{ product.loadIndex }}</strong></div><div><span>Ātruma indekss</span><strong>{{ product.speedIndex }}</strong></div><div><span>Sezona</span><strong>{{ product.seasonLabel }}</strong></div><div><span>Degvielas efektivitāte</span><strong>{{ product.fuel || 'Nav datu' }}</strong></div><div><span>Saķere uz slapja ceļa</span><strong>{{ product.wet || 'Nav datu' }}</strong></div><div><span>Ārējais troksnis</span><strong>{{ product.noise == null ? 'Nav datu' : `${product.noise} dB` }}</strong></div><div><span>Papildu marķējumi</span><strong>{{ product.markings.length ? product.markings.join(', ') : 'Nav norādīti' }}</strong></div></div><p class="spec-disclaimer"><Info :size="16" aria-hidden="true" />Marķējuma vērtības ir piemēri. Pārbaudi tās pie riepu ražotāja.</p></div><aside class="context-card"><span class="context-icon"><Info :size="19" aria-hidden="true" /></span><h3>Saderību pārbaudi pēc dokumentiem.</h3><p>Modeļa un izmēra sakritība pati par sevi negarantē saderību ar tavu auto. Salīdzini riepu izmēru ar automašīnas dokumentācijā apstiprinātajiem izmēriem.</p><a href="#offers">Apskatīt cenas<ArrowRight :size="16" aria-hidden="true" /></a></aside></section>
      <section id="offers" class="offer-section" aria-labelledby="offers-title"><div class="offer-heading"><div><p class="section-kicker">Piedāvājumi</p><h2 id="offers-title">Salīdzini cenas.</h2><p>Izvēlies piedāvājumu un norādi riepu skaitu.</p></div><label>Riepu skaits<select v-model.number="quantity"><option :value="1">1 riepa</option><option :value="2">2 riepas</option><option :value="4">4 riepas</option></select></label></div><p class="offer-notice"><Info :size="16" aria-hidden="true" />Veikali, cenas un pieejamība šeit ir tikai piemēri.</p><div class="offer-table-wrap" role="region" aria-label="Tirgotāju piedāvājumu tabula" tabindex="0"><table><thead><tr><th scope="col">Tirgotava</th><th scope="col">Cena / riepu</th><th scope="col">Pieejamība</th><th scope="col">Piegāde</th><th scope="col">Kopā / {{ quantity }} gab.</th><th scope="col">Izvēle</th></tr></thead><tbody><tr v-for="offer in sortedOffers" :key="offer.id" :class="{selected:selectedOffer?.id === offer.id}"><td><strong>{{ offer.merchant }}</strong><small>Piemēra veikals</small></td><td>{{ formatPrice(offer.price) }}</td><td>{{ offer.availability }}</td><td>{{ offer.shipping.type === 'unknown' ? 'Izmaksas nav zināmas' : `${formatPrice(offer.shipping.amount)} / pasūtījumu${offer.shipping.type === 'free-from-quantity' ? `; bez maksas no ${offer.shipping.quantity} riepām` : ''}` }}</td><td><strong>{{ eur(calculateOfferTotal(offer, quantity).total) }}</strong><small v-if="calculateOfferTotal(offer, quantity).total !== null">{{ formatPrice(calculateOfferTotal(offer, quantity).products) }} preces + {{ formatPrice(calculateOfferTotal(offer, quantity).shipping) }} piegāde</small><small v-else>Preces: {{ formatPrice(calculateOfferTotal(offer, quantity).products) }} · piegāde nav zināma</small></td><td><button class="select-offer" type="button" :aria-pressed="selectedOffer?.id === offer.id" @click="selectOffer(offer)">{{ selectedOffer?.id === offer.id ? 'Izvēlēts' : 'Izvēlēties' }}</button></td></tr></tbody></table></div><div class="offer-summary"><div><span>Izvēlētais piedāvājums</span><strong>{{ selectedOffer?.merchant || 'Nav izvēlēts' }} · {{ quantity }} riepas</strong><small>{{ formatPrice(pricePerTire) }} par riepu · preču summa {{ formatPrice(selectedTotal?.products || 0) }}</small></div><div><span>Kopā ar piegādi</span><strong>{{ eur(selectedTotal?.total ?? null) }}</strong><small v-if="selectedTotal?.shipping === null">Piegādes maksa nav zināma; precīzu kopējo summu noteikt nevar.</small><small v-else>Piegāde: {{ formatPrice(selectedTotal?.shipping || 0) }}</small></div><UiButton :disabled="!selectedOffer?.available" @click="addSelectedOffer"><Check :size="17" aria-hidden="true" />Pievienot izvēlēto piedāvājumu</UiButton></div><p class="offer-bottom-note">Piegādes cena nav norādīta kā 0 €, ja tā nav zināma.</p></section>
    </template>
    <div v-if="feedback" class="product-feedback" role="status" aria-live="polite">{{ feedback }}<RouterLink to="/cart">Atvērt grozu</RouterLink></div>
  </main>
</template>
<style scoped>
.product-page { padding-block:32px 88px; }.breadcrumbs {display:flex;flex-wrap:wrap;gap:10px;color:var(--color-secondary);font-size:12px}.breadcrumbs a:hover{color:var(--color-accent-hover)}.demo-banner,.offer-notice,.spec-disclaimer {display:flex;align-items:flex-start;gap:10px;padding:14px 16px;border:1px solid var(--color-border);border-radius:12px;background:var(--color-surface);font-size:12px;color:#52525b}.demo-banner {margin:28px 0}.demo-banner svg,.offer-notice svg,.spec-disclaimer svg{flex-shrink:0}.product-hero{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:64px}.product-image{position:relative;background:#f8f9fa;border-radius:18px}.product-image img{display:block;width:100%;height:auto;aspect-ratio:1;object-fit:contain;padding:40px;mix-blend-mode:multiply}.product-image>span{position:absolute;bottom:16px;right:18px;color:var(--color-secondary);font-size:10px}.product-brand{color:var(--color-secondary);font-size:12px;letter-spacing:.12em;text-transform:uppercase;margin:0 0 12px}.product-intro h1{margin:0;font-size:clamp(38px,4vw,58px);letter-spacing:-.05em;line-height:1.06}.product-size{font-size:18px;margin:18px 0 14px}.product-size span{color:var(--color-secondary)}.season-tag{display:inline-flex;padding:7px 10px;background:#f1f2f4;border-radius:7px;font-size:11px}.hero-price{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-top:32px;padding-block:20px;border-top:1px solid var(--color-border);border-bottom:1px solid var(--color-border)}.hero-price small{display:block;color:var(--color-secondary);font-size:11px;margin-bottom:6px}.hero-price strong{font-size:32px;letter-spacing:-1px}.hero-price>span{font-size:11px;color:var(--color-secondary)}.hero-buttons{display:flex;align-items:center;flex-wrap:wrap;gap:18px;margin-top:24px}.hero-button{gap:8px}.text-action{display:flex;align-items:center;gap:8px;font-size:12px}.text-action:hover{color:var(--color-accent-hover)}.price-note{color:var(--color-secondary);font-size:11px}.product-details{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:48px;margin-top:80px}.section-kicker{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-hover);font-weight:600;margin:0 0 10px}.section-heading h2,.offer-heading h2{font-size:30px;letter-spacing:-1px;margin:0}.section-heading>p:last-child,.offer-heading>div>p:last-child{font-size:13px;color:var(--color-secondary);margin:12px 0 24px}.spec-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid var(--color-border)}.spec-grid>div{padding:18px 12px;border-bottom:1px solid var(--color-border);display:grid;gap:8px}.spec-grid>div span{font-size:11px;color:var(--color-secondary)}.spec-grid>div strong{font-size:14px;font-weight:600}.spec-disclaimer{margin-top:20px;font-size:11px}.context-card{align-self:start;padding:24px;border:1px solid var(--color-border);border-radius:16px;background:#f8f9fa}.context-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:#fff;color:var(--color-accent-hover)}.context-card h3{font-size:17px;line-height:1.35;margin:20px 0 8px}.context-card p{font-size:12px;color:var(--color-secondary);margin:0}.context-card a{display:flex;align-items:center;gap:8px;margin-top:20px;font-size:12px;font-weight:600}.offer-section{margin-top:88px;scroll-margin-top:110px}.offer-heading{display:flex;justify-content:space-between;align-items:end;gap:24px}.offer-heading label{display:grid;gap:8px;font-size:12px;font-weight:600;white-space:nowrap}.offer-heading select{min-width:130px}.offer-notice{margin:24px 0 16px}.offer-table-wrap{overflow-x:auto;border:1px solid var(--color-border);border-radius:14px}table{width:100%;min-width:850px;border-collapse:collapse;text-align:left;font-size:12px}th{padding:14px 16px;background:#f8f9fa;color:var(--color-secondary);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em}td{padding:18px 16px;border-top:1px solid var(--color-border);vertical-align:middle}td>strong,td>small{display:block}td>small{margin-top:5px;color:var(--color-secondary);font-size:10px}.selected{background:#fffafa}.select-offer{min-height:40px;padding:8px 12px;border:1px solid var(--color-border);background:white;border-radius:8px;font-size:11px}.selected .select-offer{border-color:var(--color-accent);color:var(--color-accent-hover)}.offer-summary{display:grid;grid-template-columns:1fr 1fr auto;align-items:center;gap:24px;padding:24px;margin-top:16px;border:1px solid var(--color-border);border-radius:14px}.offer-summary>div{display:grid;gap:6px}.offer-summary span,.offer-summary small{color:var(--color-secondary);font-size:10px}.offer-summary strong{font-size:15px}.offer-summary button{font-size:11px;padding-inline:14px}.offer-bottom-note{font-size:11px;color:var(--color-secondary)}.product-state{min-height:55vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;color:var(--color-secondary)}.product-state h1{color:var(--color-text);font-size:34px}.product-state p{font-size:14px}.spinner{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.product-feedback{position:fixed;z-index:15;bottom:24px;left:50%;transform:translateX(-50%);display:flex;flex-wrap:wrap;gap:14px;align-items:center;width:max-content;max-width:calc(100% - 32px);padding:16px 20px;background:#18181b;color:white;border-radius:12px;font-size:12px;box-shadow:0 8px 30px #0002}.product-feedback a{color:white;text-decoration:underline}
@media(max-width:950px){.product-hero{gap:32px}.product-details{grid-template-columns:1fr;gap:24px}.context-card{max-width:560px}.offer-summary{grid-template-columns:1fr 1fr}.offer-summary button{grid-column:1/-1}}
@media(max-width:650px){.product-page{padding-top:24px}.product-hero{grid-template-columns:1fr;gap:24px}.product-image img{padding:24px}.product-intro h1{font-size:42px}.product-details{margin-top:56px}.spec-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.offer-section{margin-top:56px}.offer-heading{align-items:start;flex-direction:column}.offer-heading h2{font-size:26px}.offer-summary{grid-template-columns:1fr;padding:18px}.offer-summary button{grid-column:auto}.product-feedback{left:16px;right:16px;transform:none;width:auto;justify-content:space-between}}
</style>
