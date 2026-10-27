<script setup>
import { Fuel, Droplets, Volume2, ShoppingBag, ArrowUpRight, Heart, Scale } from '@lucide/vue'
import UiButton from '../ui/UiButton.vue'
import { formatPrice } from '../../utils/format'
import { RouterLink } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { hasFavorite, hasCompared, toggleFavorite, toggleCompared } from '../../stores/selection'
import { useAuth } from '../../services/auth.js'
import { useRouter } from 'vue-router'
const emit = defineEmits(['add'])
const router = useRouter()
const { isAuthenticated } = useAuth()
const imageBase = import.meta.env.BASE_URL
const props = defineProps({ product: { type: Object, required: true }, added: Boolean, list: Boolean })
const favorite = ref(hasFavorite(props.product.id))
const compared = ref(hasCompared(props.product.id))
const notice = ref('')
function refreshSelection() {
  favorite.value = hasFavorite(props.product.id)
  compared.value = hasCompared(props.product.id)
}
function changeFavorite() {
  if (!isAuthenticated.value) { router.push({ name: 'login', query: { redirect: '/favorites' } }); return }
  favorite.value = toggleFavorite(props.product.id)
  notice.value = favorite.value ? 'Pievienota izlasei.' : 'Noņemta no izlases.'
}
function changeCompare() {
  if (!isAuthenticated.value) { router.push({ name: 'login', query: { redirect: '/compare' } }); return }
  const result = toggleCompared(props.product.id)
  compared.value = hasCompared(props.product.id)
  notice.value = result.full ? 'Salīdzinājumā var pievienot līdz 4 riepām.' : compared.value ? 'Pievienota salīdzināšanai.' : 'Noņemta no salīdzinājuma.'
}
function addProduct() {
  if (!isAuthenticated.value) { router.push({ name: 'login', query: { redirect: '/cart' } }); return }
  emit('add', props.product)
}
onMounted(() => window.addEventListener('ecatalog:selection-updated', refreshSelection))
onMounted(() => window.addEventListener('ecatalog:auth-updated', refreshSelection))
onBeforeUnmount(() => window.removeEventListener('ecatalog:selection-updated', refreshSelection))
onBeforeUnmount(() => window.removeEventListener('ecatalog:auth-updated', refreshSelection))
</script>
<template>
  <article class="tire-card" :class="{'is-list': list}">
    <div class="tire-visual"><span class="season-badge">{{ product.seasonLabel }}</span><div class="card-actions"><button type="button" :aria-label="favorite ? 'Noņemt no izlases' : 'Pievienot izlasei'" :aria-pressed="favorite" @click="changeFavorite"><Heart :size="18" aria-hidden="true" /></button><button type="button" :aria-label="compared ? 'Noņemt no salīdzinājuma' : 'Pievienot salīdzināšanai'" :aria-pressed="compared" @click="changeCompare"><Scale :size="18" aria-hidden="true" /></button></div><img :src="`${imageBase}${product.image}`" alt="" width="1254" height="1254" loading="lazy" /><span class="illustration-note">Ilustratīvs attēls</span></div>
    <div class="tire-body"><p class="tire-brand">{{ product.brand }}</p><RouterLink class="product-title-link" :to="`/product/${product.id}`"><h2>{{ product.model }}<ArrowUpRight :size="16" aria-hidden="true" /></h2></RouterLink><p class="tire-size">{{ product.size }} <span>· {{ product.loadIndex }}{{ product.speedIndex }}</span></p><div class="label-values" aria-label="Marķējuma vērtību piemēri"><span :aria-label="`Degvielas efektivitāte: ${product.fuel || 'nav datu'}`"><Fuel :size="15" aria-hidden="true" />{{ product.fuel || '—' }}</span><span :aria-label="`Saķere uz slapja ceļa: ${product.wet || 'nav datu'}`"><Droplets :size="15" aria-hidden="true" />{{ product.wet || '—' }}</span><span :aria-label="`Ārējais troksnis: ${product.noise == null ? 'nav datu' : product.noise + ' dB'}`"><Volume2 :size="15" aria-hidden="true" />{{ product.noise == null ? '—' : product.noise + ' dB' }}</span></div></div>
    <div class="tire-purchase"><div class="price-line"><div><small>Piemēra cena / gab.</small><strong>{{ formatPrice(product.price) }}</strong></div><span class="stock-label" :class="{available: product.available}">{{ product.available ? 'Pieejama' : 'Nav pieejama' }}</span></div><UiButton variant="secondary" :disabled="!product.available" @click="addProduct"><ShoppingBag :size="16" aria-hidden="true" />{{ added ? 'Pievienots grozam' : 'Pievienot grozam' }}</UiButton><span class="visually-hidden" aria-live="polite">{{ notice }}</span></div>
  </article>
</template>
<style scoped>
.tire-card { border: 1px solid var(--color-border); border-radius: 16px; overflow: hidden; background: white; display: flex; flex-direction: column; min-width: 0; transition: border-color .18s; }.tire-card:hover { border-color: #b6b6be; }.tire-visual { position: relative; background: var(--color-surface); }.tire-visual img { display: block; width: 100%; height: 220px; padding: 28px; object-fit: contain; mix-blend-mode: multiply; }.season-badge { position: absolute; top: 12px; left: 12px; z-index: 1; background: white; padding: 6px 8px; border-radius: 6px; font-size: 11px; }.card-actions { position:absolute;z-index:2;right:12px;top:12px;display:flex;gap:6px }.card-actions button { display:grid;place-items:center;width:36px;height:36px;border:1px solid var(--color-border);border-radius:50%;background:white;color:var(--color-text) }.card-actions button[aria-pressed=true] { color:var(--color-accent-hover);border-color:var(--color-accent) }.card-actions button:focus-visible { outline:2px solid var(--color-accent);outline-offset:2px }.illustration-note { position: absolute; bottom: 8px; right: 12px; font-size: 11px; color: var(--color-secondary); }.tire-body { padding: 20px 20px 0; flex: 1; }.tire-brand { margin: 0 0 8px; text-transform: uppercase; letter-spacing: .1em; font-size: 11px; color: var(--color-secondary); }h2 { font-size: 18px; letter-spacing: -.5px; margin: 0; line-height: 1.3; }.product-title-link h2 { display:flex; align-items:center; gap:5px; }.product-title-link h2 svg { color:var(--color-secondary); opacity:0; transition:opacity .15s; }.product-title-link:hover h2 svg,.product-title-link:focus-visible h2 svg { opacity:1; }.tire-size { font-size: 13px; margin: 12px 0 16px; }.tire-size span { color: var(--color-secondary); }.label-values { display: flex; gap: 16px; flex-wrap: wrap; }.label-values span { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; }.label-values svg { color: var(--color-secondary); }.demo-spec-note { margin: 10px 0 0; color: var(--color-secondary); font-size: 11px; }.tire-purchase { padding: 20px; }.price-line { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 8px; border-top: 1px solid var(--color-border); padding-top: 16px; margin-bottom: 16px; }.price-line small { display: block; font-size: 11px; color: var(--color-secondary); margin-bottom: 4px; }.price-line strong { display: block; font-size: 22px; letter-spacing: -.8px; }.stock-label { font-size: 11px; color: var(--color-secondary); }.stock-label.available { color: #18713a; }.tire-purchase button { width: 100%; font-size: 12px; padding-inline: 8px; }
.tire-card.is-list { display: grid; grid-template-columns: 180px minmax(0,1fr) 200px; align-items: center; }.tire-card.is-list .tire-body { padding: 20px; }.tire-card.is-list .price-line { border-top: 0; padding-top: 0; }
@media(max-width: 1100px) { .tire-card.is-list { grid-template-columns: 140px minmax(0,1fr); }.tire-card.is-list .tire-purchase { grid-column: 2; padding-top: 0; }.tire-card.is-list .tire-visual { grid-row: span 2; align-self: stretch; display: grid; align-items: center; } }
@media(max-width: 600px) { .tire-card.is-list { grid-template-columns: 110px minmax(0,1fr); }.tire-card.is-list .tire-body { padding: 16px; }.tire-card.is-list .tire-purchase { padding: 0 16px 16px; }.tire-card.is-list .tire-visual img { padding: 8px; height: 160px; }.tire-card.is-list .season-badge { font-size: 11px; inset: 10px 6px auto; padding: 5px; }.tire-card.is-list .illustration-note { right: 4px; font-size: 8px; } }
</style>
