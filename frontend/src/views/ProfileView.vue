<template>
	<main class="auth-shell">
		<section class="auth-card" aria-labelledby="profile-title">
			<header class="auth-header">
				<RouterLink class="brand" to="/" aria-label="E-Catalog home">
					<span class="brand-mark" aria-hidden="true"></span>
					<span>E-Catalog</span>
				</RouterLink>

				<div class="header-actions">
					<RouterLink class="header-link" to="/catalog">Catalog</RouterLink>
					<AuthNav />
				</div>
	
			</header>

			<div class="profile-container">
				<div class="profile-top">
					<div class="avatar" aria-hidden="true">{{ initials }}</div>
					<div>
						<h1 id="profile-title" class="profile-title">{{ form.name || 'Your profile' }}</h1>
						<p class="profile-info">Manage your account information and preferences.</p>
					</div>
				</div>

				<div class="stats">
					<div class="stat"><strong>{{ orders.length }}</strong><span>Orders</span></div>
					<div class="stat"><strong>€{{ totalSpent }}</strong><span>Total spent</span></div>
					<div class="stat"><strong>{{ form.tireSize || '—' }}</strong><span>Preferred size</span></div>
				</div>

				<div class="profile-grid">
					<!-- Account details -->
					<form class="panel" @submit.prevent="save">
						<h2>Account details</h2>

						<label class="field">
							<span>Full name</span>
							<input v-model.trim="form.name" type="text" autocomplete="name" placeholder="Your name" />
						</label>

						<label class="field">
							<span>Email</span>
							<input v-model.trim="form.email" type="email" autocomplete="email" placeholder="you@example.com" />
						</label>

						<label class="field">
							<span>Phone</span>
							<input v-model.trim="form.phone" type="tel" autocomplete="tel" placeholder="+371 ..." />
						</label>

						<label class="field">
							<span>Preferred tire size</span>
							<input v-model.trim="form.tireSize" type="text" placeholder="e.g. 205/55 R16" />
						</label>

						<div class="form-actions">
							<button class="primary" type="submit">Save changes</button>
							<span v-if="saved" class="saved" role="status">Saved ✓</span>
						</div>
					</form>

					<!-- Orders -->
					<section class="panel">
						<h2>Recent orders</h2>

					<ul v-if="orders.length" class="orders">
						<li v-for="order in orders" :key="order.id">
							<RouterLink class="order-link" :to="`/orders/${order.id.replace('#', '')}`">
								<div>
									<strong>{{ orderTitle(order) }}</strong>
									<small>{{ order.date }} · {{ order.id }}</small>
								</div>
								<div class="order-right">
									<span class="status" :class="order.status.toLowerCase()">{{ order.status }}</span>
									<strong>€{{ orderTotal(order) }}</strong>
								</div>
							</RouterLink>
						</li>
					</ul>

						<div v-else class="empty">
							<p>You have no orders yet.</p>
							<RouterLink class="primary link-btn" to="/catalog">Browse catalog</RouterLink>
						</div>
					</section>
				</div>
			</div>
			<AppFooter />
		</section>
		
	</main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

import AppFooter from '../components/AppFooter.vue'  
const STORAGE_KEY = 'e-catalog-profile'

const form = reactive({ name: '', email: '', phone: '', tireSize: '' })
const saved = ref(false)


try {
	const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
	if (stored) Object.assign(form, stored)
} catch {
	/* ignore */
}

import { loadOrders, orderTotal, orderTitle } from '../composables/orders'

const allOrders = ref(loadOrders())


const orders = computed(() =>
	allOrders.value
		.filter((o) => form.email && o.email.toLowerCase() === form.email.toLowerCase())
		.sort((a, b) => b.date.localeCompare(a.date)),
)

const totalSpent = computed(() => orders.value.reduce((sum, o) => sum + orderTotal(o), 0))

const initials = computed(() => {
	const parts = form.name.split(' ').filter(Boolean)
	if (!parts.length) return '?'
	return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
})

function save() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
	} catch {
		/* ignore */
	}
	saved.value = true
	window.setTimeout(() => (saved.value = false), 2000)
}

</script>

<style scoped>
/* Shell, header and footer: skip this block if you already have these rules elsewhere */
.auth-shell { min-height: 100vh; padding: 20px; background: #24211f; }
.auth-card { display: flex; flex-direction: column; min-height: calc(100vh - 40px); border-radius: 64px; background: #fff; box-shadow: 0 18px 55px rgb(0 0 0 / 18%); overflow: hidden; }
.auth-header { display: flex; align-items: center; justify-content: space-between; padding: 22px 5%; border-bottom: 1px solid #ededed; }
.brand { display: inline-flex; align-items: center; gap: 9px; color: #19232b; font-size: 22px; font-weight: 700; letter-spacing: -1.1px; text-decoration: none; }
.brand-mark { width: 24px; height: 24px; border: 3px solid transparent; border-radius: 50%; background: linear-gradient(#fff, #fff) padding-box, conic-gradient(#ff4b13, #ffd400, #00a9e8, #a13bdb, #ff4b13) border-box; }
.header-actions { display: flex; align-items: center; gap: 24px; }
.header-link { color: #4e555a; font-size: 14px; text-decoration: none; }
.header-link:hover { color: #111820; }
.auth-footer { display: flex; align-items: center; justify-content: space-between; padding: 22px 5%; border-top: 1px solid #ededed; color: #858585; font-size: 13px; }
.auth-footer nav { display: flex; align-items: center; gap: 20px; }
.auth-footer a { color: #4e555a; text-decoration: none; }
.auth-footer button { border: 0; background: transparent; color: #4e555a; font-size: 13px; cursor: pointer; }

/* Profile */
.profile-container { flex: 1; width: min(100% - 40px, 1100px); margin: auto; padding: 56px 0 72px; }
.profile-top { display: flex; align-items: center; gap: 24px; }
.avatar { display: grid; flex-shrink: 0; width: 84px; height: 84px; place-items: center; border-radius: 50%; background: #161b20; color: #fff; font-size: 30px; font-weight: 600; }
.profile-title { margin: 0; color: #19232b; font-size: clamp(34px, 4vw, 52px); font-weight: 400; letter-spacing: -2.2px; line-height: 1; }
.profile-info { margin: 10px 0 0; color: #697177; font-size: 16px; }

.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 40px; }
.stat { padding: 20px 22px; border: 1px solid #ededed; border-radius: 22px; }
.stat strong { display: block; color: #19232b; font-size: 26px; font-weight: 500; letter-spacing: -1px; }
.stat span { color: #858585; font-size: 13px; }

.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
.panel { padding: 28px; border: 1px solid #ededed; border-radius: 26px; }
.panel h2 { margin: 0 0 22px; color: #19232b; font-size: 20px; font-weight: 600; letter-spacing: -.5px; }

.field { display: block; margin-bottom: 16px; }
.field span { display: block; margin-bottom: 7px; color: #697177; font-size: 13px; }
.field input { width: 100%; box-sizing: border-box; padding: 13px 18px; border: 1px solid #dedede; border-radius: 22px; outline: 0; color: #19232b; font-size: 14px; }
.field input:focus { border-color: #19232b; }

.form-actions { display: flex; align-items: center; gap: 14px; margin-top: 24px; }
.primary { padding: 13px 22px; border: 0; border-radius: 22px; background: #161b20; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; }
.primary:hover { background: #3b4248; }
.saved { color: #4d7a54; font-size: 13px; }

.orders { margin: 0; padding: 0; list-style: none; }
.orders li { border-bottom: 1px solid #ededed; }
.order-link { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 0; color: inherit; text-decoration: none; }
.order-link:hover strong { color: #ef552c; }
.status.pending, .status.processing { background: #fdf0d9; color: #a0690f; }
.status.cancelled { background: #fdecea; color: #c0392b; }
.orders li:last-child { border-bottom: 0; }
.orders strong { display: block; color: #19232b; font-size: 14px; }
.orders small { color: #858585; font-size: 12px; }
.order-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; text-align: right; }
.status { padding: 4px 10px; border-radius: 12px; background: #f2f1ef; color: #4e555a; font-size: 11px; }
.status.delivered { background: #e6f2e8; color: #4d7a54; }
.status.shipped { background: #e6f0f7; color: #2d6a96; }

.empty { padding: 30px 0; text-align: center; }
.empty p { margin: 0 0 18px; color: #697177; }
.link-btn { display: inline-block; }

@media (max-width: 800px) {
	.auth-shell { padding: 0; }
	.auth-card { min-height: 100vh; border-radius: 0; }
	.auth-header, .auth-footer { padding-left: 20px; padding-right: 20px; }
	.profile-grid { grid-template-columns: 1fr; }
	.stats { grid-template-columns: 1fr; }
	.profile-top { flex-direction: column; align-items: flex-start; }
}
</style>