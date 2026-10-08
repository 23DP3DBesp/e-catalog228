<template>
	<main class="od-shell">
		<section class="od-card">
			<header class="od-header">
				<RouterLink class="brand" to="/" aria-label="E-Catalog home">
					<span class="brand-mark" aria-hidden="true"></span>
					<span>E-Catalog</span>
				</RouterLink>
				<RouterLink class="back" to="/profile">← Back to profile</RouterLink>
			</header>

			<div v-if="order" class="od-content">
				<p class="eyebrow">Order details</p>
				<h1>Order {{ order.id }}</h1>
				<p class="meta">Placed on {{ order.date }}</p>

			
				<p v-if="order.status === 'Cancelled'" class="cancelled">This order was cancelled.</p>
				<ol v-else class="steps" aria-label="Order progress">
					<li v-for="(s, i) in STEPS" :key="s" :class="{ done: i <= stepIndex, current: i === stepIndex }">
						<span class="dot">{{ i <= stepIndex ? '✓' : i + 1 }}</span>
						<span>{{ s }}</span>
					</li>
				</ol>

				<div class="grid">
					<section class="panel">
						<h2>Items</h2>
						<ul class="lines">
							<li v-for="(item, i) in order.items" :key="i">
								<span>{{ item.name }} × {{ item.qty }}</span>
								<strong>€{{ item.qty * item.price }}</strong>
							</li>
						</ul>
						<div class="row"><span>Subtotal</span><strong>€{{ itemsTotal(order) }}</strong></div>
						<div v-if="order.shipping" class="row"><span>Shipping</span><strong>€{{ order.shipping.price }}</strong></div>
						<div class="row total"><span>Total</span><strong>€{{ orderTotal(order) }}</strong></div>
					</section>

					<section class="panel">
						<h2>Delivery</h2>
						<template v-if="order.shipping">
							<p>
								{{ order.customer }}<br />
								{{ order.shipping.street }}<br />
								{{ order.shipping.postal }} {{ order.shipping.city }}<br />
								{{ order.shipping.country }}
							</p>
							<p class="muted">Phone: {{ order.shipping.phone }}</p>
							<p class="muted">Method: {{ order.shipping.method === 'express' ? 'Express' : 'Standard' }}</p>
						</template>
						<p v-else class="muted">No delivery details saved for this order.</p>

						<h2 class="space">Payment</h2>
						<p>{{ paymentLabel }}</p>
					</section>
				</div>
			</div>

			<div v-else class="od-content">
				<h1>Order not found</h1>
				<p class="meta">This order doesn't exist.</p>
				<RouterLink class="btn" to="/profile">Back to profile</RouterLink>
			</div>
		</section>
	</main>
</template>

<script setup>
import { computed } from 'vue'
import { loadOrders, orderTotal, itemsTotal } from '../composables/orders'

const props = defineProps({ id: String })

const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered']
const PAYMENTS = { card: 'Card (Stripe)', cod: 'Pay on delivery', transfer: 'Bank transfer' }

const order = computed(() => loadOrders().find((o) => o.id === `#${props.id}`))
const stepIndex = computed(() => STEPS.indexOf(order.value?.status))
const paymentLabel = computed(() => PAYMENTS[order.value?.payment] ?? 'Not specified')
</script>

<style scoped>
.od-shell { display: flex; min-height: 100vh; padding: 20px; background: #24211f; }
.od-card { display: flex; width: 100%; min-height: calc(100vh - 40px); flex-direction: column; border-radius: 64px; background: #fff; }
.od-header { display: flex; align-items: center; justify-content: space-between; padding: 34px 5% 28px; border-bottom: 1px solid #ededed; }
.brand { display: inline-flex; align-items: center; gap: 9px; color: #19232b; font-size: 22px; font-weight: 700; letter-spacing: -1.1px; text-decoration: none; }
.brand-mark { width: 24px; height: 24px; border: 3px solid transparent; border-radius: 50%; background: linear-gradient(#fff, #fff) padding-box, conic-gradient(#ff4b13, #ffd400, #00a9e8, #a13bdb, #ff4b13) border-box; }
.back { color: #4e555a; font-size: 14px; text-decoration: none; }
.back:hover { color: #ef552c; }

.od-content { flex: 1; width: min(100% - 40px, 1000px); margin: auto; padding: 56px 0 80px; }
.eyebrow { margin: 0 0 14px; color: #ef552c; font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
h1 { margin: 0; color: #19232b; font-size: clamp(36px, 5vw, 60px); font-weight: 400; letter-spacing: -2.6px; line-height: 1; }
.meta { margin: 12px 0 0; color: #697177; }

.steps { display: flex; margin: 36px 0 0; padding: 0; list-style: none; }
.steps li { display: flex; flex: 1; flex-direction: column; align-items: center; gap: 8px; color: #858585; font-size: 13px; text-align: center; }
.dot { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 50%; background: #f2f1ef; font-size: 13px; font-weight: 600; }
.steps .done { color: #19232b; }
.steps .done .dot { background: #161b20; color: #fff; }
.steps .current .dot { background: #ef552c; }
.cancelled { margin: 32px 0 0; padding: 16px 20px; border-radius: 18px; background: #fdecea; color: #c0392b; }

.grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 18px; margin-top: 36px; align-items: start; }
.panel { padding: 26px 28px; border: 1px solid #ededed; border-radius: 26px; }
.panel h2 { margin: 0 0 16px; color: #19232b; font-size: 18px; font-weight: 600; }
.panel h2.space { margin-top: 28px; }
.panel p { margin: 0 0 10px; color: #19232b; font-size: 14px; line-height: 1.55; }
.muted { color: #697177 !important; }
.lines { margin: 0 0 8px; padding: 0; list-style: none; }
.lines li { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f3f3f3; font-size: 14px; }
.row { display: flex; justify-content: space-between; padding: 10px 0 0; color: #4e555a; font-size: 14px; }
.row.total { margin-top: 10px; padding-top: 14px; border-top: 1px solid #ededed; color: #19232b; font-size: 17px; font-weight: 600; }
.btn { display: inline-block; margin-top: 24px; padding: 14px 22px; border-radius: 24px; background: #161b20; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; }

@media (max-width: 800px) {
	.od-shell { padding: 0; }
	.od-card { min-height: 100vh; border-radius: 0; }
	.od-header { padding: 24px 28px 20px; }
	.grid { grid-template-columns: 1fr; }
	.steps { font-size: 11px; }
}
</style>