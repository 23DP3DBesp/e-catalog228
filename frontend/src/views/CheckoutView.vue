<template>
	<main class="co-shell">
		<section class="co-card" aria-labelledby="checkout-title">
			<header class="co-header">
				<RouterLink class="brand" to="/" aria-label="E-Catalog home">
					<span class="brand-mark" aria-hidden="true"></span>
					<span>E-Catalog</span>
				</RouterLink>
				<nav class="co-nav" aria-label="Checkout navigation">
					<RouterLink to="/cart">← Back to cart</RouterLink>
				</nav>
			</header>

			<div class="co-content">
				<!-- Confirmation -->
				<section v-if="placedOrder" class="co-done" aria-live="polite">
					<div class="done-mark" aria-hidden="true">✓</div>
					<h1>Thank you for your order!</h1>
					<p>Your order <strong>{{ placedOrder.id }}</strong> has been placed. A confirmation will be sent to {{ placedOrder.email }}.</p>
					<div class="done-actions">
						<RouterLink class="primary" to="/catalog">Continue shopping</RouterLink>
						<RouterLink class="ghost" to="/profile">View profile</RouterLink>
					</div>
				</section>

				<!-- Empty cart -->
				<section v-else-if="!items.length" class="co-done">
					<h1>Nothing to check out</h1>
					<p>Your cart is empty.</p>
					<div class="done-actions">
						<RouterLink class="primary" to="/catalog">Browse catalog</RouterLink>
					</div>
				</section>

				<template v-else>
					<div class="co-heading">
						<p class="co-eyebrow">Almost there</p>
						<h1 id="checkout-title">Checkout</h1>
					</div>

					<form class="co-layout" @submit.prevent="placeOrder">
						<div class="co-fields">
							<section class="co-panel">
								<h2>Contact</h2>
								<div class="row">
									<label class="field"><span>Full name</span><input v-model.trim="form.name" type="text" autocomplete="name" required /></label>
									<label class="field"><span>Phone</span><input v-model.trim="form.phone" type="tel" autocomplete="tel" required /></label>
								</div>
								<label class="field"><span>Email</span><input v-model.trim="form.email" type="email" autocomplete="email" required /></label>
							</section>

							<section class="co-panel">
								<h2>Delivery address</h2>
								<label class="field"><span>Street and number</span><input v-model.trim="form.street" type="text" autocomplete="street-address" required /></label>
								<div class="row">
									<label class="field"><span>City</span><input v-model.trim="form.city" type="text" autocomplete="address-level2" required /></label>
									<label class="field"><span>Postal code</span><input v-model.trim="form.postal" type="text" autocomplete="postal-code" required /></label>
								</div>
								<label class="field"><span>Country</span>
									<select v-model="form.country" autocomplete="country-name">
										<option>Latvia</option>
										<option>Lithuania</option>
										<option>Estonia</option>
										<option>Other EU</option>
									</select>
								</label>
							</section>

							<section class="co-panel">
								<h2>Shipping method</h2>
								<label v-for="m in shippingMethods" :key="m.id" class="option" :class="{ selected: form.shipping === m.id }">
									<input v-model="form.shipping" type="radio" name="shipping" :value="m.id" />
									<span><strong>{{ m.label }}</strong><small>{{ m.note }}</small></span>
									<em>€{{ m.price }}</em>
								</label>
							</section>

							<section class="co-panel">
								<h2>Payment</h2>
								<label v-for="p in paymentMethods" :key="p.id" class="option" :class="{ selected: form.payment === p.id }">
									<input v-model="form.payment" type="radio" name="payment" :value="p.id" />
									<span><strong>{{ p.label }}</strong><small>{{ p.note }}</small></span>
								</label>
							</section>
						</div>

						<aside class="co-summary" aria-label="Order summary">
							<div class="summary-topline">
								<span>Order summary</span>
								<span class="summary-count">{{ count }} {{ count === 1 ? 'item' : 'items' }}</span>
							</div>

							<ul class="summary-items">
								<li v-for="item in items" :key="item.id">
									<span>{{ item.brand }} {{ item.model }} × {{ item.quantity }}</span>
									<strong>€{{ item.price * item.quantity }}</strong>
								</li>
							</ul>

							<div class="summary-row"><span>Subtotal</span><strong>€{{ subtotal }}</strong></div>
							<div class="summary-row"><span>Shipping</span><strong>€{{ shippingPrice }}</strong></div>
							<div class="summary-total"><span>Total</span><strong>€{{ total }}</strong></div>

							<label class="terms">
								<input v-model="form.agree" type="checkbox" required />
								<span>I agree to the terms and conditions</span>
							</label>

							<button class="place-order" type="submit" :disabled="placing">{{ placing ? 'Placing order…' : `Place order · €${total}` }}</button>
						</aside>
					</form>
				</template>
			</div>

			<AppFooter />
		</section>
	</main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { getCart, getCartCount, removeFromCart } from '../stores/cart'
import { orders as seedOrders } from '../data/orders'
import AppFooter from '../components/AppFooter.vue' 
//
const CARD_ENABLED = false  

const paymentMethods = [
	...(CARD_ENABLED ? [{ id: 'card', label: 'Card (Stripe)', note: 'Pay securely by card on Stripe' }] : []),
	{ id: 'cod', label: 'Pay on delivery', note: 'Pay the courier when your order arrives' },
	{ id: 'transfer', label: 'Bank transfer', note: 'Payment details are sent by email' },
]

const ORDERS_KEY = 'e-catalog-admin-orders'
const PROFILE_KEY = 'e-catalog-profile'

const shippingMethods = [
	{ id: 'standard', label: 'Standard', note: '3–5 business days', price: 9 },
	{ id: 'express', label: 'Express', note: '1–2 business days', price: 19 },
]

const items = ref(getCart())
const placing = ref(false)
const placedOrder = ref(null)

const form = reactive({
	name: '', email: '', phone: '',
	street: '', city: '', postal: '', country: 'Latvia',
	shipping: 'standard', payment: 'cod', agree: false,
})


try {
	const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null')
	if (profile) {
		form.name = profile.name || ''
		form.email = profile.email || ''
		form.phone = profile.phone || ''
	}
} catch {
	/* ignore */
}

const count = computed(() => getCartCount(items.value))
const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0))
const shippingPrice = computed(() => shippingMethods.find((m) => m.id === form.shipping)?.price ?? 0)
const total = computed(() => subtotal.value + shippingPrice.value)

function saveOrder() {
	let existing
	try {
		const stored = JSON.parse(localStorage.getItem(ORDERS_KEY) || 'null')
		if (Array.isArray(stored)) existing = stored
	} catch {
		/* ignore */
	}
	
	const list = existing ?? seedOrders.map((o) => ({ ...o, items: o.items.map((i) => ({ ...i })) }))

	const nextNumber = list.reduce((max, o) => Math.max(max, parseInt(String(o.id).replace(/\D/g, ''), 10) || 0), 1000) + 1

	const order = {
	id: `#${nextNumber}`,
	userId: null,
	customer: form.name,
	email: form.email,
	date: new Date().toISOString().slice(0, 10),
	status: 'Pending',
	payment: form.payment,
	shipping: {
		method: form.shipping,
		price: shippingPrice.value,
		phone: form.phone,
		street: form.street,
		city: form.city,
		postal: form.postal,
		country: form.country,
	},
	total: total.value,
	items: items.value.map((i) => ({ name: `${i.brand} ${i.model}`, qty: i.quantity, price: i.price })),
}

	list.push(order)
	localStorage.setItem(ORDERS_KEY, JSON.stringify(list))
	return order
}

function placeOrder() {
	if (placing.value || !items.value.length) return
	placing.value = true

	try {
		const order = saveOrder()
	
		;[...items.value].forEach((i) => removeFromCart(i.id))
		items.value = []
		placedOrder.value = order
		window.scrollTo({ top: 0, behavior: 'smooth' })
	} catch {
		window.alert('Sorry, we could not place your order. Please try again.')
	} finally {
		placing.value = false
	}
}
</script>

<style scoped>
.co-shell { display: flex; min-height: 100vh; padding: 20px; background: #24211f; }
.co-card { display: flex; width: 100%; min-height: calc(100vh - 40px); flex-direction: column; border-radius: 64px; background: #fff; box-shadow: 0 18px 55px rgb(0 0 0 / 18%); }
.co-header, .co-footer { display: flex; align-items: center; justify-content: space-between; }
.co-header { padding: 34px 5% 28px; border-bottom: 1px solid #ededed; }
.brand, .co-nav a, .co-footer a { color: inherit; text-decoration: none; }
.brand { display: inline-flex; align-items: center; gap: 9px; font-size: 22px; font-weight: 700; letter-spacing: -1.1px; }
.brand-mark { display: inline-block; width: 24px; height: 24px; border: 3px solid transparent; border-radius: 50%; background: linear-gradient(#fff, #fff) padding-box, conic-gradient(#ff4b13, #ffd400, #00a9e8, #a13bdb, #ff4b13) border-box; }
.co-nav { color: #4e555a; font-size: 14px; }
.co-nav a:hover, .co-footer a:hover { color: #ef552c; }
.co-content { flex: 1; width: min(100% - 40px, 1060px); margin: auto; padding: 64px 0 90px; }
.co-eyebrow { margin: 0 0 17px; color: #ef552c; font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.co-heading h1 { margin: 0; color: #19232b; font-size: clamp(46px, 6vw, 76px); font-weight: 400; letter-spacing: -3.5px; line-height: .98; }

.co-layout { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 28px; margin-top: 48px; align-items: start; }
.co-fields { display: grid; gap: 16px; }
.co-panel { padding: 26px 28px; border: 1px solid #ededed; border-radius: 26px; }
.co-panel h2 { margin: 0 0 20px; color: #19232b; font-size: 19px; font-weight: 600; letter-spacing: -.4px; }

.field { display: block; margin-bottom: 14px; }
.field:last-child { margin-bottom: 0; }
.field span { display: block; margin-bottom: 6px; color: #697177; font-size: 13px; }
.field input, .field select { width: 100%; box-sizing: border-box; padding: 12px 16px; border: 1px solid #dedede; border-radius: 20px; outline: 0; background: #fff; color: #19232b; font-size: 14px; }
.field input:focus, .field select:focus { border-color: #19232b; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.option { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; padding: 14px 18px; border: 1px solid #dedede; border-radius: 20px; cursor: pointer; transition: border-color .2s ease, background .2s ease; }
.option:last-child { margin-bottom: 0; }
.option.selected { border-color: #161b20; background: #fafaf9; }
.option input { accent-color: #ef552c; }
.option span { flex: 1; }
.option strong { display: block; color: #19232b; font-size: 14px; }
.option small { color: #858585; font-size: 12px; }
.option em { color: #19232b; font-size: 14px; font-style: normal; font-weight: 600; }

.co-summary { position: sticky; top: 24px; padding: 28px; border-radius: 28px; background: #f7f6f4; }
.summary-topline, .summary-row, .summary-total { display: flex; align-items: center; justify-content: space-between; }
.summary-topline { padding-bottom: 20px; border-bottom: 1px solid #e4e2df; color: #19232b; font-size: 16px; font-weight: 600; }
.summary-count { color: #858585; font-size: 12px; font-weight: 400; }
.summary-items { margin: 0; padding: 14px 0; border-bottom: 1px solid #e4e2df; list-style: none; }
.summary-items li { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; color: #4e555a; font-size: 13px; }
.summary-items strong { color: #19232b; font-weight: 600; white-space: nowrap; }
.summary-row { padding: 16px 0 0; color: #4e555a; font-size: 14px; }
.summary-row strong { color: #19232b; font-weight: 600; }
.summary-total { margin-top: 20px; padding-top: 18px; border-top: 1px solid #e4e2df; color: #19232b; font-size: 16px; font-weight: 600; }
.summary-total strong { font-size: 22px; }
.terms { display: flex; align-items: flex-start; gap: 10px; margin-top: 22px; color: #697177; font-size: 13px; cursor: pointer; }
.terms input { margin-top: 2px; accent-color: #ef552c; }
.place-order { width: 100%; margin-top: 20px; padding: 16px; border: 0; border-radius: 28px; background: linear-gradient(100deg, #a40505, #f63a3a 42%, #dd5e4b); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; }
.place-order:hover { filter: brightness(1.08); }
.place-order:disabled { opacity: .6; cursor: not-allowed; }

.co-done { max-width: 520px; margin: 40px auto; text-align: center; }
.done-mark { display: grid; width: 72px; height: 72px; margin: 0 auto 24px; place-items: center; border-radius: 50%; background: #e6f2e8; color: #4d7a54; font-size: 32px; }
.co-done h1 { margin: 0; color: #19232b; font-size: clamp(32px, 4vw, 46px); font-weight: 400; letter-spacing: -2px; }
.co-done p { margin: 16px 0 28px; color: #697177; font-size: 16px; line-height: 1.55; }
.done-actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
.primary, .ghost { padding: 14px 22px; border-radius: 24px; font-size: 14px; font-weight: 600; text-decoration: none; }
.primary { background: #161b20; color: #fff; }
.primary:hover { background: #3b4248; }
.ghost { border: 1px solid #dedede; color: #19232b; }
.ghost:hover { border-color: #19232b; }

.co-footer { padding: 0 5% 34px; color: #8a8a8a; font-size: 12px; }
.co-footer a { color: #262626; }

@media (max-width: 900px) {
	.co-layout { grid-template-columns: 1fr; }
	.co-summary { position: static; }
}
@media (max-width: 760px) {
	.co-shell { padding: 0; }
	.co-card { min-height: 100vh; border-radius: 0; }
	.co-header { padding: 24px 28px 20px; }
	.co-content { width: min(100% - 56px, 1060px); padding: 48px 0 70px; }
	.co-footer { padding: 0 28px 35px; }
	.row { grid-template-columns: 1fr; gap: 0; }
}
</style>