<template>
	<main class="ok-shell">
		<section class="ok-card">
			<template v-if="state === 'checking'">
				<h1>Confirming your payment…</h1>
			</template>
			<template v-else-if="state === 'paid'">
				<div class="mark" aria-hidden="true">✓</div>
				<h1>Payment received</h1>
				<p>Thank you! Your order <strong>{{ orderId }}</strong> is confirmed.</p>
				<RouterLink class="btn" to="/catalog">Continue shopping</RouterLink>
			</template>
			<template v-else>
				<h1>Payment not completed</h1>
				<p>We could not confirm your payment. You have not been charged, or the payment is still processing.</p>
				<RouterLink class="btn" to="/cart">Back to cart</RouterLink>
			</template>
			<AppFooter />
		</section>
	</main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getCart, removeFromCart } from '../stores/cart'
import AppFooter from '../components/AppFooter.vue'  
const ORDERS_KEY = 'e-catalog-admin-orders'
const route = useRoute()
const state = ref('checking')
const orderId = ref('')

function markPaid(id) {
	try {
		const list = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]')
		const order = list.find((o) => o.id === id)
		if (order) order.status = 'Processing'
		localStorage.setItem(ORDERS_KEY, JSON.stringify(list))
	} catch {
		/* ignore */
	}
}

onMounted(async () => {
	try {
		const res = await fetch(`/api/checkout/status?session_id=${encodeURIComponent(route.query.session_id ?? '')}`)
		const data = await res.json()
		if (res.ok && data.paid) {
			orderId.value = data.orderId
			markPaid(data.orderId)
			getCart().forEach((i) => removeFromCart(i.id))
			state.value = 'paid'
		} else {
			state.value = 'failed'
		}
	} catch {
		state.value = 'failed'
	}
})
</script>

<style scoped>
.ok-shell { display: grid; min-height: 100vh; padding: 20px; place-items: center; background: #24211f; }
.ok-card { width: min(100%, 520px); padding: 56px 40px; border-radius: 48px; background: #fff; text-align: center; }
.mark { display: grid; width: 72px; height: 72px; margin: 0 auto 24px; place-items: center; border-radius: 50%; background: #e6f2e8; color: #4d7a54; font-size: 32px; }
h1 { margin: 0; color: #19232b; font-size: 38px; font-weight: 400; letter-spacing: -1.8px; }
p { margin: 16px 0 28px; color: #697177; line-height: 1.55; }
.btn { display: inline-block; padding: 14px 22px; border-radius: 24px; background: #161b20; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; }
</style>