<template>
	<main class="auth-shell">
		<section class="auth-card" aria-labelledby="product-title">
			<header class="auth-header">
				<RouterLink class="brand" to="/" aria-label="E-Catalog home">
					<span class="brand-mark" aria-hidden="true"></span>
					<span>E-Catalog</span>
				</RouterLink>

				<div class="catalog-nav-links">
					<RouterLink class="cart-link" to="/cart" aria-label="Open shopping cart">
						Cart <span>{{ cartCount }}</span>
					</RouterLink>
					<RouterLink class="header-link" to="/catalog">← Back to catalog</RouterLink>
				</div>
			</header>

			<div class="profile-container">
				<template v-if="product">
					<div class="detail-layout">
						<div class="product-visual" :class="`season-${product.season}`">
							<span class="tire-shape" aria-hidden="true"></span>
							<span class="product-season">{{ product.seasonLabel }}</span>
						</div>

						<div class="detail-info">
							<p class="product-brand">{{ product.brand }}</p>
							<h1 id="product-title" class="profile-title">{{ product.model }}</h1>
							<span class="product-stock">In stock</span>

							<dl class="detail-specs">
								<div><dt>Size</dt><dd>{{ product.size }}</dd></div>
								<div><dt>Load index</dt><dd>{{ product.loadIndex }}</dd></div>
								<div><dt>Speed index</dt><dd>{{ product.speedIndex }}</dd></div>
								<div><dt>Season</dt><dd>{{ product.seasonLabel }}</dd></div>
							</dl>

							<div class="product-footer">
								<strong>€{{ product.price }}</strong>
								<button type="button" @click="add">{{ added ? 'Added' : 'Add to cart' }}</button>
							</div>
						</div>
					</div>

					<!-- Expandable info under the card -->
					<div class="info-sections">
						<details class="info-item" open>
							<summary>Description</summary>
							<p>{{ description }}</p>
						</details>

						<details class="info-item">
							<summary>Full specifications</summary>
							<dl class="detail-specs flat">
								<div><dt>Brand</dt><dd>{{ product.brand }}</dd></div>
								<div><dt>Model</dt><dd>{{ product.model }}</dd></div>
								<div><dt>Size</dt><dd>{{ product.size }}</dd></div>
								<div><dt>Load index</dt><dd>{{ product.loadIndex }}</dd></div>
								<div><dt>Speed index</dt><dd>{{ product.speedIndex }}</dd></div>
								<div><dt>Season</dt><dd>{{ product.seasonLabel }}</dd></div>
							</dl>
						</details>

						<details class="info-item">
							<summary>Shipping &amp; returns</summary>
							<p>Replace this text with your real delivery and return policy.</p>
						</details>
					</div>

					<!-- Suggestions -->
					<section v-if="suggestions.length" class="suggestions" aria-labelledby="suggestions-title">
						<h2 id="suggestions-title">You might also like</h2>
						<div class="suggestions-grid">
							<RouterLink
								v-for="item in suggestions"
								:key="item.id"
								class="suggestion-card"
								:to="{ name: 'product-details', params: { id: item.id } }"
							>
								<div class="suggestion-visual" :class="`season-${item.season}`">
									<span class="tire-shape mini" aria-hidden="true"></span>
								</div>
								<p class="product-brand">{{ item.brand }}</p>
								<h3>{{ item.model }}</h3>
								<p class="suggestion-meta">{{ item.size }} · {{ item.seasonLabel }}</p>
								<strong>€{{ item.price }}</strong>
							</RouterLink>
						</div>
					</section>
				</template>

				<div v-else>
					<h1 id="product-title" class="profile-title">Product not found</h1>
					<p class="profile-info">This product doesn't exist or was removed.</p>
				</div>
			</div>

			
			<footer class="auth-footer">
				<span>&copy; 2026 E-Catalog</span>
				<nav aria-label="Footer navigation">
					<a href="mailto:contact@example.com">Contact Us</a>
					<button type="button">English <span aria-hidden="true">⌄</span></button>
				</nav>
			</footer>
		</section>
	</main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { addToCart, getCart, getCartCount } from '../stores/cart'
import { products } from '../data/products'

const props = defineProps({ id: String })

const product = computed(() => products.find((p) => p.id === Number(props.id)))
const added = ref(false)
const quantity = ref(1)
const cartCount = ref(getCartCount(getCart()))

const descriptions = {
	summer: 'Designed for warm and wet roads, with sharp handling, short braking distances and a comfortable ride in summer conditions.',
	winter: 'Built for cold weather, snow and ice, with a flexible compound that keeps grip when temperatures drop below 7°C.',
	'all-season': 'A year-round tire that balances dry grip, wet braking and light winter capability, so you do not need to swap seasonally.',
}

const description = computed(() => {
	if (!product.value) return ''
	return `${product.value.brand} ${product.value.model} in size ${product.value.size}. ${descriptions[product.value.season] ?? ''}`
})


const suggestions = computed(() => {
	if (!product.value) return []
	const others = products.filter((p) => p.id !== product.value.id)
	const sameSeason = others.filter((p) => p.season === product.value.season)
	const different = others.filter((p) => p.season !== product.value.season)
	return [...sameSeason, ...different].slice(0, 3)
})

function add() {
	let cart
	for (let i = 0; i < quantity.value; i++) {
		cart = addToCart(product.value)
	}
	cartCount.value = getCartCount(cart)
	added.value = true
	window.setTimeout(() => (added.value = false), 1400)
}

watch(() => props.id, () => {
	added.value = false
	quantity.value = 1
	window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
/* 1. PASTE HERE the styles from your Profile view's <style> block */
.catalog-nav-links, .catalog-nav-actions { display: flex; align-items: center; gap: 28px; }
.catalog-nav-links { justify-content: center; }
.catalog-nav-actions { justify-content: flex-end; }
.catalog-nav-link, .cart-link { color: #4e555a; font-size: 14px; text-decoration: none; }
.catalog-nav-link:hover, .catalog-nav-link.active { color: #111820; }
.catalog-nav-link.active { font-weight: 600; }
.cart-link span { display: inline-grid; width: 21px; height: 21px; margin-left: 4px; place-items: center; border-radius: 50%; background: #ef552c; color: #fff; font-size: 11px; }
cart-link span { display: inline-grid; width: 21px; height: 21px; margin-left: 4px; place-items: center; border-radius: 50%; background: #ef552c; color: #fff; font-size: 11px; }
/* 2. Product details */
.detail-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
.product-visual { position: relative; display: grid; min-height: 380px; place-items: center; border-radius: 32px; background: #f2f1ef; }
.product-visual.season-winter, .suggestion-visual.season-winter { background: #edf2f2; }
.product-visual.season-all-season, .suggestion-visual.season-all-season { background: #f3f0ea; }
.tire-shape { width: 190px; height: 190px; border: 34px solid #25292b; border-radius: 50%; box-shadow: inset 0 0 0 8px #4d5355, 0 10px 12px rgb(0 0 0 / 17%); transform: rotate(-18deg); }
.tire-shape::after { display: block; width: 50px; height: 50px; margin: 34px auto; border: 8px solid #b7b6b0; border-radius: 50%; content: ''; }
.tire-shape.mini { width: 84px; height: 84px; border-width: 15px; box-shadow: inset 0 0 0 4px #4d5355, 0 6px 8px rgb(0 0 0 / 17%); }
.tire-shape.mini::after { width: 22px; height: 22px; margin: 14px auto; border-width: 4px; }
.product-season { position: absolute; top: 16px; right: 16px; padding: 7px 10px; border-radius: 14px; background: rgb(255 255 255 / 72%); color: #4e555a; font-size: 11px; }
.product-brand { margin: 0 0 5px; color: #ef552c; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.product-stock { color: #4d7a54; font-size: 12px; }
.detail-specs { margin: 28px 0; border-top: 1px solid #ededed; }
.detail-specs.flat { margin: 12px 0 0; }
.detail-specs div { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #ededed; font-size: 14px; }
.detail-specs dt { color: #697177; }
.detail-specs dd { margin: 0; color: #19232b; font-weight: 600; }
.product-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.product-footer strong { color: #19232b; font-size: 26px; font-weight: 600; }
.product-footer button { padding: 14px 22px; border: 0; border-radius: 22px; background: #161b20; color: #fff; cursor: pointer; font-size: 13px; font-weight: 600; }
.product-footer button:hover { background: #3b4248; }

/* 3. Expandable sections */
.info-sections { margin-top: 48px; border-top: 1px solid #ededed; }
.info-item { border-bottom: 1px solid #ededed; }
.info-item summary { display: flex; align-items: center; justify-content: space-between; padding: 20px 0; color: #19232b; font-size: 17px; font-weight: 600; cursor: pointer; list-style: none; }
.info-item summary::-webkit-details-marker { display: none; }
.info-item summary::after { content: '+'; color: #ef552c; font-size: 24px; font-weight: 400; }
.info-item[open] summary::after { content: '−'; }
.info-item p { margin: 0 0 22px; max-width: 640px; color: #697177; font-size: 15px; line-height: 1.6; }

/* 4. Suggestions */
.suggestions { margin-top: 64px; }
.suggestions h2 { margin: 0 0 20px; color: #19232b; font-size: 26px; font-weight: 500; letter-spacing: -1px; }
.suggestions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.suggestion-card { display: block; padding: 14px 14px 18px; border: 1px solid #ededed; border-radius: 22px; color: inherit; text-decoration: none; transition: transform .2s ease, box-shadow .2s ease; }
.suggestion-card:hover { transform: translateY(-3px); box-shadow: 0 16px 30px rgb(25 35 43 / 10%); }
.suggestion-visual { display: grid; min-height: 140px; margin-bottom: 14px; place-items: center; border-radius: 16px; background: #f2f1ef; }
.suggestion-card h3 { margin: 0; color: #19232b; font-size: 17px; font-weight: 600; }
.suggestion-meta { margin: 6px 0 12px; color: #697177; font-size: 13px; }
.suggestion-card strong { color: #19232b; font-size: 18px; }

@media (max-width: 800px) {
	.detail-layout { grid-template-columns: 1fr; gap: 28px; }
	.product-visual { min-height: 260px; }
	.suggestions-grid { grid-template-columns: 1fr; }
}
</style>