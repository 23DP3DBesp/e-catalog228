<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ClipboardList, Users, ShieldCheck, X } from '@lucide/vue'
import { getProfile } from '../services/api.js'
import { updateAuthUser } from '../services/auth.js'
import { getAdminOrders, getAdminOrder, updateOrderStatus, getAdminUsers } from '../services/admin.js'
import { formatPrice } from '../utils/format.js'

const router = useRouter()

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const LABELS = { pending: 'Gaida apstiprinājumu', confirmed: 'Apstiprināts', shipped: 'Nosūtīts', delivered: 'Piegādāts', cancelled: 'Atcelts' }
// Same rules as the backend (order.service.js); the server enforces them anyway
const NEXT = { pending: ['confirmed', 'cancelled'], confirmed: ['shipped', 'cancelled'], shipped: ['delivered'], delivered: [], cancelled: [] }
const statusLabel = value => LABELS[value] || value
const dateTime = value => (value ? new Intl.DateTimeFormat('lv-LV', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—')

const ready = ref(false)
const tab = ref('orders')
const notice = ref('')

// ---- orders ----
const orders = ref([])
const ordersPage = ref(1)
const ordersTotal = ref(0)
const ordersPages = ref(1)
const statusFilter = ref('')
const ordersLoading = ref(false)
const ordersError = ref('')

async function loadOrders() {
  ordersLoading.value = true
  ordersError.value = ''
  try {
    const result = await getAdminOrders({ status: statusFilter.value, page: ordersPage.value })
    orders.value = result.items
    ordersTotal.value = result.total
    ordersPages.value = Math.max(1, result.totalPages)
  } catch (cause) {
    ordersError.value = cause.message
  } finally { ordersLoading.value = false }
}
watch(statusFilter, () => { ordersPage.value = 1; loadOrders() })
function goOrders(page) { ordersPage.value = page; loadOrders() }

// ---- order details ----
const dialog = ref(null)
const selected = ref(null)
const detailLoading = ref(false)
const detailError = ref('')
const changing = ref(false)
const nextStatuses = computed(() => (selected.value ? NEXT[selected.value.status] || [] : []))

async function openOrder(row) {
  selected.value = null
  detailError.value = ''
  detailLoading.value = true
  dialog.value.showModal()
  try { selected.value = await getAdminOrder(row.id) } catch (cause) { detailError.value = cause.message } finally { detailLoading.value = false }
}
function closeOrder() { dialog.value?.close() }

async function changeStatus(next) {
  if (next === 'cancelled' && !window.confirm(`Atcelt pasūtījumu #${selected.value.id}? Šo darbību nevar atsaukt.`)) return
  changing.value = true
  detailError.value = ''
  try {
    const updated = await updateOrderStatus(selected.value.id, next)
    selected.value = updated
    const row = orders.value.find(item => item.id === updated.id)
    if (row) row.status = updated.status
    notice.value = `Pasūtījuma #${updated.id} statuss: ${statusLabel(updated.status)}.`
  } catch (cause) {
    detailError.value = cause.message
  } finally { changing.value = false }
}

// ---- users ----
const users = ref([])
const usersPage = ref(1)
const usersTotal = ref(0)
const usersPages = ref(1)
const usersLoading = ref(false)
const usersError = ref('')
let usersLoaded = false

async function loadUsers() {
  usersLoading.value = true
  usersError.value = ''
  try {
    const result = await getAdminUsers({ page: usersPage.value })
    users.value = result.items
    usersTotal.value = result.total
    usersPages.value = Math.max(1, result.totalPages)
    usersLoaded = true
  } catch (cause) {
    usersError.value = cause.message
  } finally { usersLoading.value = false }
}
function goUsers(page) { usersPage.value = page; loadUsers() }
watch(tab, value => { notice.value = ''; if (value === 'users' && !usersLoaded) loadUsers() })

onMounted(async () => {
  // Ask the server who we are; the stored role is only a hint
  try {
    const profile = await getProfile()
    if (profile.role !== 'admin') { router.replace('/'); return }
    updateAuthUser({ role: 'admin' })
    ready.value = true
    loadOrders()
  } catch {
    router.replace('/')
  }
})
</script>

<template>
  <main v-if="ready" class="container admin-page">
    <header class="admin-heading">
      <div><p class="kicker"><ShieldCheck :size="14" aria-hidden="true" /> Administrēšana</p><h1>Vadības panelis</h1></div>
      <div class="tabs" role="group" aria-label="Sadaļa">
        <button type="button" :aria-pressed="tab === 'orders'" @click="tab = 'orders'"><ClipboardList :size="16" aria-hidden="true" />Pasūtījumi</button>
        <button type="button" :aria-pressed="tab === 'users'" @click="tab = 'users'"><Users :size="16" aria-hidden="true" />Lietotāji</button>
      </div>
    </header>

    <p v-if="notice" class="message" role="status">{{ notice }}</p>

    <!-- Orders -->
    <section v-if="tab === 'orders'" aria-labelledby="orders-title">
      <div class="toolbar">
        <h2 id="orders-title">Pasūtījumi <span class="count">{{ ordersTotal }}</span></h2>
        <label>Statuss
          <select v-model="statusFilter"><option value="">Visi</option><option v-for="status in STATUSES" :key="status" :value="status">{{ statusLabel(status) }}</option></select>
        </label>
      </div>
      <p v-if="ordersError" class="message error" role="alert">{{ ordersError }}</p>
      <div class="table-wrap" :aria-busy="ordersLoading">
        <table v-if="orders.length">
          <thead><tr><th scope="col">Nr.</th><th scope="col">Datums</th><th scope="col">Klients</th><th scope="col">Riepas</th><th scope="col">Kopā</th><th scope="col">Statuss</th><th scope="col"><span class="sr-only">Darbības</span></th></tr></thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>#{{ order.id }}</td>
              <td>{{ dateTime(order.createdAt) }}</td>
              <td>{{ order.customerName }}</td>
              <td>{{ order.itemCount }}</td>
              <td>{{ formatPrice(order.total) }}</td>
              <td><span class="badge" :data-status="order.status">{{ statusLabel(order.status) }}</span></td>
              <td><button type="button" class="link-button" @click="openOrder(order)">Atvērt</button></td>
            </tr>
          </tbody>
        </table>
        <p v-else-if="!ordersLoading" class="empty">Nav pasūtījumu{{ statusFilter ? ' ar izvēlēto statusu' : '' }}.</p>
        <p v-else class="empty">Ielādē…</p>
      </div>
      <div v-if="ordersPages > 1" class="pager">
        <button type="button" :disabled="ordersPage <= 1 || ordersLoading" @click="goOrders(ordersPage - 1)">← Iepriekšējā</button>
        <span>{{ ordersPage }} / {{ ordersPages }}</span>
        <button type="button" :disabled="ordersPage >= ordersPages || ordersLoading" @click="goOrders(ordersPage + 1)">Nākamā →</button>
      </div>
    </section>

    <!-- Users -->
    <section v-else aria-labelledby="users-title">
      <div class="toolbar"><h2 id="users-title">Lietotāji <span class="count">{{ usersTotal }}</span></h2></div>
      <p v-if="usersError" class="message error" role="alert">{{ usersError }}</p>
      <div class="table-wrap" :aria-busy="usersLoading">
        <table v-if="users.length">
          <thead><tr><th scope="col">Vārds</th><th scope="col">E-pasts</th><th scope="col">Loma</th><th scope="col">Reģistrējās</th><th scope="col">Pēdējā pierakstīšanās</th></tr></thead>
          <tbody>
            <tr v-for="person in users" :key="person.id">
              <td>{{ person.displayName || '—' }}</td>
              <td>{{ person.email }}</td>
              <td><span class="badge" :data-role="person.role">{{ person.role === 'admin' ? 'Administrators' : 'Lietotājs' }}</span></td>
              <td>{{ dateTime(person.createdAt) }}</td>
              <td>{{ dateTime(person.lastSignInAt) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">{{ usersLoading ? 'Ielādē…' : 'Nav lietotāju.' }}</p>
      </div>
      <div v-if="usersPages > 1" class="pager">
        <button type="button" :disabled="usersPage <= 1 || usersLoading" @click="goUsers(usersPage - 1)">← Iepriekšējā</button>
        <span>{{ usersPage }} / {{ usersPages }}</span>
        <button type="button" :disabled="usersPage >= usersPages || usersLoading" @click="goUsers(usersPage + 1)">Nākamā →</button>
      </div>
    </section>

    <!-- Order details -->
    <dialog ref="dialog" class="order-dialog" aria-labelledby="order-title" @click="event => { if (event.target === dialog) closeOrder() }">
      <div class="dialog-top">
        <h2 id="order-title">Pasūtījums {{ selected ? `#${selected.id}` : '' }}</h2>
        <button type="button" class="icon" aria-label="Aizvērt" @click="closeOrder"><X :size="20" aria-hidden="true" /></button>
      </div>
      <p v-if="detailError" class="message error" role="alert">{{ detailError }}</p>
      <p v-if="detailLoading" class="empty">Ielādē…</p>
      <div v-if="selected">
        <p class="meta"><span class="badge" :data-status="selected.status">{{ statusLabel(selected.status) }}</span> {{ dateTime(selected.createdAt) }}</p>
        <dl class="customer">
          <div><dt>Klients</dt><dd>{{ selected.customer.fullName }}</dd></div>
          <div><dt>Tālrunis</dt><dd>{{ selected.customer.phone }}</dd></div>
          <div><dt>Adrese</dt><dd>{{ selected.customer.address }}, {{ selected.customer.city }}, {{ selected.customer.postalCode }}</dd></div>
        </dl>
        <div class="table-wrap">
          <table>
            <thead><tr><th scope="col">Riepa</th><th scope="col">Pārdevējs</th><th scope="col">Cena</th><th scope="col">Skaits</th><th scope="col">Kopā</th></tr></thead>
            <tbody>
              <tr v-for="item in selected.items" :key="item.offerId">
                <td>{{ item.brand }} {{ item.model }}<br><small>{{ item.size }}</small></td>
                <td>{{ item.merchant }}</td>
                <td>{{ formatPrice(item.unitPrice) }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ formatPrice(item.lineTotal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul v-if="selected.shipping?.length" class="shipping">
          <li v-for="part in selected.shipping" :key="part.merchantId">Piegāde ({{ part.merchant }}, {{ part.quantity }} gab.): {{ formatPrice(part.cost) }}</li>
        </ul>
        <p class="totals">Riepas {{ formatPrice(selected.productsTotal) }} · Piegāde {{ formatPrice(selected.shippingTotal) }} · <strong>Kopā {{ formatPrice(selected.total) }}</strong></p>
        <div class="status-actions">
          <template v-if="nextStatuses.length">
            <span>Mainīt statusu:</span>
            <button v-for="next in nextStatuses" :key="next" type="button" :class="{ danger: next === 'cancelled' }" :disabled="changing" @click="changeStatus(next)">{{ statusLabel(next) }}</button>
          </template>
          <span v-else class="final">Šim pasūtījumam statusu vairs nevar mainīt.</span>
        </div>
      </div>
    </dialog>
  </main>
</template>

<style scoped>
.admin-page{padding-block:32px 80px}
.admin-heading{display:flex;align-items:end;justify-content:space-between;gap:24px;margin:16px 0 28px}
.kicker{display:flex;align-items:center;gap:6px;margin:0 0 10px;color:var(--color-accent-hover);font-size:10px;letter-spacing:.14em;text-transform:uppercase}
.admin-heading h1{margin:0;font-size:clamp(32px,4vw,48px);letter-spacing:-.05em}
.tabs{display:flex;gap:6px;padding:4px;border:1px solid var(--color-border);border-radius:10px}
.tabs button{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 14px;border:0;border-radius:7px;background:none;color:var(--color-secondary);font:inherit;font-size:13px;font-weight:600;cursor:pointer}
.tabs button[aria-pressed="true"]{background:var(--color-accent);color:white}
.toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px}
.toolbar h2{margin:0;font-size:20px}
.count{margin-left:6px;color:var(--color-secondary);font-size:14px;font-weight:500}
.toolbar label{display:flex;align-items:center;gap:10px;color:var(--color-secondary);font-size:13px}
.toolbar select{min-height:40px;padding:0 10px;border:1px solid var(--color-border);border-radius:8px;background:transparent;color:var(--color-text);font:inherit}
.table-wrap{overflow-x:auto;border:1px solid var(--color-border);border-radius:14px}
table{width:100%;min-width:560px;border-collapse:collapse;font-size:14px}
th,td{padding:14px 18px;text-align:left;border-bottom:1px solid var(--color-border);vertical-align:top}
tbody tr:last-child td{border-bottom:0}
th{color:var(--color-secondary);font-size:12px;font-weight:600;white-space:nowrap}
small{color:var(--color-secondary)}
.empty{margin:0;padding:32px;text-align:center;color:var(--color-secondary);font-size:14px}
.badge{display:inline-block;padding:3px 10px;border-radius:999px;background:rgba(127,127,127,.15);font-size:12px;font-weight:600;white-space:nowrap}
.badge[data-status="pending"]{background:#fef3c7;color:#92400e}
.badge[data-status="confirmed"]{background:#dbeafe;color:#1e40af}
.badge[data-status="shipped"]{background:#ede9fe;color:#5b21b6}
.badge[data-status="delivered"],.badge[data-role="admin"]{background:#dcfce7;color:#166534}
.badge[data-status="cancelled"]{background:#fee2e2;color:#991b1b}
.link-button{border:0;background:none;color:var(--color-accent-hover);font:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:6px 0}
.pager{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:16px;font-size:13px;color:var(--color-secondary)}
.pager button,.status-actions button{min-height:40px;padding:0 14px;border:1px solid var(--color-border);border-radius:8px;background:transparent;color:var(--color-text);font:inherit;font-size:13px;font-weight:600;cursor:pointer}
.pager button:disabled,.status-actions button:disabled{opacity:.45;cursor:not-allowed}
.message{margin:0 0 16px;font-size:13px}
.message.error{color:#b91c1c}
.order-dialog{width:min(760px,calc(100vw - 32px));max-height:calc(100vh - 48px);padding:24px;border:1px solid var(--color-border);border-radius:16px;background:var(--color-background,#fff);color:var(--color-text)}
.order-dialog::backdrop{background:rgba(0,0,0,.45)}
.dialog-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.dialog-top h2{margin:0;font-size:22px}
.icon{display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:8px;background:none;color:inherit;cursor:pointer}
.meta{display:flex;align-items:center;gap:12px;margin:0 0 16px;color:var(--color-secondary);font-size:13px}
.customer{display:grid;gap:10px;margin:0 0 20px}
.customer div{display:grid;grid-template-columns:110px 1fr;gap:12px;font-size:14px}
.customer dt{color:var(--color-secondary)}
.customer dd{margin:0}
.shipping{margin:16px 0 0;padding-left:18px;color:var(--color-secondary);font-size:13px}
.totals{margin:16px 0 20px;font-size:14px}
.status-actions{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding-top:16px;border-top:1px solid var(--color-border);font-size:13px}
.status-actions .danger{border-color:#fca5a5;color:#b91c1c}
.final{color:var(--color-secondary)}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media(max-width:700px){.admin-heading{flex-direction:column;align-items:start}.toolbar{flex-wrap:wrap}.customer div{grid-template-columns:1fr}}
</style>
