<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuth, updateAuthUser } from '../services/auth.js'
import { getProfile, getOrders, getOrder, updateProfile } from '../services/api.js'
import { formatPrice } from '../utils/format.js'

const { user } = useAuth()
const profile = ref({ displayName: user.value?.displayName || '', email: user.value?.email || '', createdAt: '' })
const orders = ref([])
const expanded = ref(null)
const orderDetails = ref(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const notice = ref('')
const joined = computed(() => profile.value.createdAt ? new Intl.DateTimeFormat('lv-LV', { dateStyle: 'long' }).format(new Date(profile.value.createdAt)) : '')
const orderDate = value => new Intl.DateTimeFormat('lv-LV', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const statusLabel = value => ({ pending: 'Gaida apstiprinājumu', confirmed: 'Apstiprināts', shipped: 'Nosūtīts', delivered: 'Piegādāts', cancelled: 'Atcelts' })[value] || value

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [details, history] = await Promise.all([getProfile(), getOrders()])
    profile.value = { ...profile.value, ...details }
    orders.value = Array.isArray(history) ? history : history.orders || []
  } catch (cause) {
    error.value = cause.message || 'Profila informāciju neizdevās ielādēt.'
  } finally { loading.value = false }
}

async function save() {
  error.value = ''; notice.value = ''; saving.value = true
  try {
    const updated = await updateProfile({ displayName: profile.value.displayName })
    profile.value = { ...profile.value, ...updated }
    updateAuthUser({ displayName: updated.displayName })
    notice.value = 'Profila vārds ir saglabāts.'
  } catch (cause) { error.value = cause.message || 'Izmaiņas neizdevās saglabāt.' }
  finally { saving.value = false }
}

async function toggleOrder(order) {
  error.value = ''
  if (expanded.value === order.id) { expanded.value = null; orderDetails.value = null; return }
  expanded.value = order.id
  orderDetails.value = null
  try { orderDetails.value = await getOrder(order.id) }
  catch (cause) { error.value = cause.message || 'Pasūtījuma informāciju neizdevās ielādēt.' }
}

onMounted(load)
</script>

<template>
  <main class="container profile-page">
    <nav class="breadcrumbs" aria-label="Atrašanās vieta"><RouterLink to="/">Sākums</RouterLink><span aria-hidden="true">/</span><span>Mans profils</span></nav>
    <header class="profile-heading"><p class="section-kicker">Personīgais konts</p><h1>Mans profils</h1><p>Pārvaldi savus datus un seko līdzi pasūtījumiem.</p></header>
    <p v-if="error" class="profile-message profile-message--error" role="alert">{{ error }}</p>
    <p v-if="notice" class="profile-message" role="status">{{ notice }}</p>
    <div v-if="loading" class="profile-loading" role="status">Ielādē profilu un pasūtījumus…</div>
    <div v-else class="profile-grid">
      <section class="profile-card" aria-labelledby="details-title">
        <p class="section-kicker">Tavi dati</p><h2 id="details-title">Profila informācija</h2>
        <form class="profile-form" @submit.prevent="save">
          <label>Vārds, uzvārds<input v-model.trim="profile.displayName" name="displayName" autocomplete="name" minlength="2" maxlength="50" required /></label>
          <label>E-pasts<input :value="profile.email" type="email" autocomplete="email" disabled /><small>E-pastu izmanto pierakstīšanās kontā.</small></label>
          <p v-if="joined" class="joined-date">Konts izveidots {{ joined }}</p>
          <button class="profile-submit" type="submit" :disabled="saving">{{ saving ? 'Saglabā…' : 'Saglabāt izmaiņas' }}</button>
        </form>
        <div class="profile-idea"><strong>Ideja nākamajam solim</strong><p>Profila papildināšana ar tālruni un piegādes adresi ļautu aizpildīt pasūtījuma formu ātrāk.</p></div>
      </section>
      <section class="orders-card" aria-labelledby="orders-title">
        <div class="orders-heading"><div><p class="section-kicker">Tavi pirkumi</p><h2 id="orders-title">Pasūtījumu vēsture</h2></div><span>{{ orders.length }}</span></div>
        <p v-if="!orders.length" class="orders-empty">Pasūtījumu vēl nav. Kad noformēsi pirkumu, tā informācija būs redzama šeit.</p>
        <div v-else class="order-list">
          <article v-for="order in orders" :key="order.id" class="order-entry">
            <button class="order-toggle" type="button" :aria-expanded="expanded === order.id" @click="toggleOrder(order)">
              <span><strong>Pasūtījums #{{ order.id }}</strong><small>{{ orderDate(order.createdAt) }} · {{ order.itemCount }} preces</small></span>
              <span class="order-total"><strong>{{ formatPrice(order.total) }}</strong><small>{{ statusLabel(order.status) }}</small></span>
            </button>
            <div v-if="expanded === order.id" class="order-detail">
              <p v-if="!orderDetails">Ielādē pasūtījumu…</p>
              <template v-else>
                <div v-for="item in orderDetails.items" :key="`${item.offerId}-${item.productId}`" class="order-line"><span>{{ item.brand }} {{ item.model }} · {{ item.size }} × {{ item.quantity }}</span><strong>{{ formatPrice(item.lineTotal) }}</strong></div>
                <div class="order-line order-line--total"><span>Preces {{ formatPrice(orderDetails.productsTotal) }} · piegāde {{ formatPrice(orderDetails.shippingTotal) }}</span><strong>Kopā {{ formatPrice(orderDetails.total) }}</strong></div>
                <p class="order-delivery">Piegāde: {{ orderDetails.customer.address }}, {{ orderDetails.customer.city }} {{ orderDetails.customer.postalCode }}</p>
              </template>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.profile-page{padding-block:32px 80px}.breadcrumbs{display:flex;gap:12px;color:var(--color-secondary);font-size:12px}.profile-heading{margin:40px 0 28px}.section-kicker{margin:0 0 10px;color:var(--color-accent-hover);font-size:10px;letter-spacing:.14em;text-transform:uppercase}.profile-heading h1{margin:0;font-size:clamp(36px,4vw,52px);letter-spacing:-.05em}.profile-heading>p:last-child{margin:12px 0 0;color:var(--color-secondary);font-size:14px}.profile-grid{display:grid;grid-template-columns:minmax(260px,.8fr) minmax(0,1.2fr);align-items:start;gap:20px}.profile-card,.orders-card{padding:26px;border:1px solid var(--color-border);border-radius:16px;background:#fff}.profile-card h2,.orders-card h2{margin:0;font-size:21px;letter-spacing:-.03em}.profile-form{display:grid;gap:16px;margin-top:22px}.profile-form label{display:grid;gap:7px;font-size:12px;font-weight:600}.profile-form input{min-height:44px;padding:10px 12px;border:1px solid var(--color-border);border-radius:8px;font:inherit}.profile-form input:disabled{background:#f5f5f4;color:var(--color-secondary)}.profile-form small{color:var(--color-secondary);font-size:11px;font-weight:400}.joined-date{margin:0;color:var(--color-secondary);font-size:12px}.profile-submit{min-height:44px;padding:0 16px;border:0;border-radius:8px;background:var(--color-accent-hover);color:#fff;font:inherit;font-size:13px;font-weight:600;cursor:pointer}.profile-submit:disabled{opacity:.6}.profile-idea{margin-top:24px;padding:14px;border-radius:10px;background:var(--color-surface)}.profile-idea strong{font-size:12px}.profile-idea p{margin:6px 0 0;color:var(--color-secondary);font-size:11px;line-height:1.5}.orders-heading{display:flex;align-items:center;justify-content:space-between}.orders-heading>span{display:grid;min-width:32px;height:32px;place-items:center;border-radius:50%;background:var(--color-surface);font-size:12px;font-weight:600}.orders-empty{margin:20px 0 0;padding:22px;border-radius:10px;background:var(--color-surface);color:var(--color-secondary);font-size:13px;line-height:1.55}.order-list{display:grid;margin-top:18px}.order-entry{border-top:1px solid var(--color-border)}.order-toggle{display:flex;width:100%;align-items:center;justify-content:space-between;gap:18px;padding:16px 0;border:0;background:transparent;text-align:left;cursor:pointer}.order-toggle>span{display:grid;gap:6px}.order-toggle strong{font-size:13px}.order-toggle small{color:var(--color-secondary);font-size:11px}.order-total{text-align:right}.order-detail{padding:0 0 16px;color:var(--color-secondary);font-size:12px}.order-line{display:flex;justify-content:space-between;gap:16px;padding:8px 0}.order-line strong{color:var(--color-text);white-space:nowrap}.order-line--total{margin-top:6px;border-top:1px solid var(--color-border)}.order-delivery{margin:10px 0 0;font-size:11px}.profile-message,.profile-loading{margin:0 0 16px;padding:13px 15px;border:1px solid var(--color-border);border-radius:9px;background:var(--color-surface);font-size:13px}.profile-message--error{border-color:#f0c4c4;color:#a32626;background:#fff8f8}.profile-loading{color:var(--color-secondary)}
@media(max-width:800px){.profile-grid{grid-template-columns:1fr}}@media(max-width:500px){.profile-page{padding-top:24px}.profile-card,.orders-card{padding:18px}.profile-heading{margin-top:28px}.order-toggle{align-items:start}}
</style>
