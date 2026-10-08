<template>
    <main class="catalog-shell">
        <section class="catalog-card">
            <nav class="catalog-nav" aria-label="Main navigation">
                <RouterLink class="brand" to="/" aria-label="E-Catalog home">
                    <span class="brand-mark" aria-hidden="true"></span>
                    <span>E-Catalog</span>
                </RouterLink>

                <div class="catalog-nav-links">
                    <RouterLink class="catalog-nav-link" to="/">Home</RouterLink>
                    <RouterLink class="catalog-nav-link active" to="/catalog">Catalog</RouterLink>
                    <RouterLink class="catalog-nav-link" to="/about">About</RouterLink>
                </div>

                <div class="catalog-nav-actions">
                    <RouterLink class="cart-link" to="/cart" aria-label="Open shopping cart">
                        Cart <span>{{ cartCount }}</span>
                    </RouterLink>
                    <RouterLink class="catalog-sign-in" to="/login">Sign In</RouterLink>
                </div>
            </nav>

            <div class="catalog-content">
                <header class="catalog-heading">
                    <div>
                        <p class="catalog-eyebrow">Product library</p>
                        <h1>Find the right fit.</h1>
                        <p>Browse, compare and save products that match your vehicle and your season.</p>
                    </div>
                    <div class="catalog-result-count" aria-live="polite">
                        <strong>{{ filteredProducts.length }}</strong>
                        <span>products found</span>
                    </div>
                </header>

                <p class="demo-notice">Demonstrācijas katalogs: cenas un pieejamība nav reāli veikalu piedāvājumi.</p>

                <div id="filters" class="catalog-toolbar">
                    <label class="search-field">
                        <span class="search-icon" aria-hidden="true">⌕</span>
                        <span class="visually-hidden">Search products</span>
                        <input v-model="searchQuery" type="search" placeholder="Search by model or brand" />
                    </label>
                    <label class="filter-select">
                        <span class="visually-hidden">Filter by season</span>
                        <select v-model="seasonFilter">
                            <option value="all">All seasons</option>
                            <option value="summer">Summer</option>
                            <option value="winter">Winter</option>
                            <option value="all-season">All-season</option>
                        </select>
                    </label>
                    <label class="filter-select">
                        <span class="visually-hidden">Sort products</span>
                        <select v-model="sortOrder">
                            <option value="featured">Featured</option>
                            <option value="price-low">Price: low to high</option>
                            <option value="price-high">Price: high to low</option>
                        </select>
                    </label>
                </div>

                <div v-if="filteredProducts.length" class="product-grid">
                    <article v-for="product in filteredProducts" :key="product.id" class="product-card">
                        <div class="product-visual" :class="`season-${product.season}`">
                            <span class="tire-shape" aria-hidden="true"></span>
                            <span class="product-season">{{ product.seasonLabel }}</span>
                        </div>
                        <div class="product-card-body">
                            <div class="product-title-row">
                                <div>
                                    <p class="product-brand">{{ product.brand }}</p>
                                    <h2>{{ product.model }}</h2>
                                </div>
                                <span class="product-stock">Demo prece</span>
                            </div>
                            <p class="product-spec">{{ product.size }} · {{ product.loadIndex }} load · {{ product.speedIndex }} speed</p>
                            <div class="product-footer">
                                <strong>{{ formatPrice(product.price) }}</strong>
                                <button type="button" @click="addToCart(product)">{{ addedProductId === product.id ? 'Added' : 'Add to cart' }}</button>
                            </div>
                        </div>
                    </article>
                </div>

                <section v-else class="catalog-empty" aria-live="polite">
                    <span class="catalog-empty-mark" aria-hidden="true">⌕</span>
                    <h2>No products found</h2>
                    <p>Try another model, brand or season.</p>
                    <button type="button" @click="clearFilters">Clear filters</button>
                </section>
            </div>
        </section>
    </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { addToCart as addCartItem, getCart, getCartCount } from '../stores/cart'

import { products } from '../data/products'
import { formatPrice } from '../utils/format'

const searchQuery = ref('')
const seasonFilter = ref('all')
const sortOrder = ref('featured')
const addedProductId = ref(null)
const cartCount = ref(getCartCount(getCart()))

const filteredProducts = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    const filtered = products.filter((product) => {
        const matchesQuery = !query || `${product.brand} ${product.model} ${product.size}`.toLowerCase().includes(query)
        const matchesSeason = seasonFilter.value === 'all' || product.season === seasonFilter.value
        return matchesQuery && matchesSeason
    })

    return [...filtered].sort((first, second) => {
        if (sortOrder.value === 'price-low') return first.price - second.price
        if (sortOrder.value === 'price-high') return second.price - first.price
        return first.id - second.id
    })
})

function addToCart(product) {
    const cart = addCartItem(product)
    cartCount.value = getCartCount(cart)
    addedProductId.value = product.id
    window.setTimeout(() => {
        if (addedProductId.value === product.id) addedProductId.value = null
    }, 1400)
}

function clearFilters() {
    searchQuery.value = ''
    seasonFilter.value = 'all'
    sortOrder.value = 'featured'
}
</script>

<style scoped>
.catalog-shell { min-height: 100vh; padding: 20px; background: #24211f; }
.catalog-card { min-height: calc(100vh - 40px); border-radius: 64px; background: #fff; box-shadow: 0 18px 55px rgb(0 0 0 / 18%); overflow: hidden; }
.catalog-nav { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 32px; padding: 22px 5%; border-bottom: 1px solid #ededed; }
.brand { display: inline-flex; align-items: center; gap: 9px; color: #19232b; font-size: 22px; font-weight: 700; letter-spacing: -1.1px; text-decoration: none; }
.brand-mark { width: 24px; height: 24px; border: 3px solid transparent; border-radius: 50%; background: linear-gradient(#fff, #fff) padding-box, conic-gradient(#ff4b13, #ffd400, #00a9e8, #a13bdb, #ff4b13) border-box; }
.catalog-nav-links, .catalog-nav-actions { display: flex; align-items: center; gap: 28px; }
.catalog-nav-links { justify-content: center; }
.catalog-nav-actions { justify-content: flex-end; }
.catalog-nav-link, .cart-link { color: #4e555a; font-size: 14px; text-decoration: none; }
.catalog-nav-link:hover, .catalog-nav-link.active { color: #111820; }
.catalog-nav-link.active { font-weight: 600; }
.cart-link span { display: inline-grid; width: 21px; height: 21px; margin-left: 4px; place-items: center; border-radius: 50%; background: #ef552c; color: #fff; font-size: 11px; }
.catalog-sign-in { padding: 10px 17px; border-radius: 22px; background: #161b20; color: #fff; font-size: 14px; text-decoration: none; }
.catalog-content { width: min(100% - 40px, 1180px); margin: auto; padding: 68px 0 90px; }
.catalog-heading { display: flex; align-items: end; justify-content: space-between; gap: 32px; }
.catalog-eyebrow { margin: 0 0 17px; color: #ef552c; font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.catalog-heading h1 { margin: 0; color: #19232b; font-size: clamp(48px, 6vw, 78px); font-weight: 400; letter-spacing: -3.8px; line-height: .96; }
.catalog-heading p:last-child { max-width: 480px; margin: 22px 0 0; color: #697177; font-size: 17px; line-height: 1.5; }
.catalog-result-count { display: flex; align-items: end; gap: 8px; padding-bottom: 5px; color: #858585; font-size: 13px; white-space: nowrap; }
.catalog-result-count strong { color: #19232b; font-size: 30px; font-weight: 500; }
.catalog-toolbar { display: grid; grid-template-columns: 1fr 175px 175px; gap: 12px; margin-top: 55px; }
.search-field, .filter-select { display: flex; align-items: center; border: 1px solid #dedede; border-radius: 28px; background: #fff; }
.search-field { padding: 0 20px; }
.search-icon { margin-right: 10px; color: #ef552c; font-size: 25px; line-height: 1; }
.search-field input, .filter-select select { width: 100%; border: 0; outline: 0; background: transparent; color: #19232b; font-size: 14px; }
.search-field input { padding: 16px 0; }
.search-field input::placeholder { color: #858585; }
.filter-select { padding: 0 16px; }
.filter-select select { padding: 16px 0; cursor: pointer; }
.product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 24px; }
.product-card { overflow: hidden; border: 1px solid #ededed; border-radius: 26px; background: #fff; transition: transform .2s ease, box-shadow .2s ease; }
.product-card:hover { transform: translateY(-3px); box-shadow: 0 16px 30px rgb(25 35 43 / 10%); }
.product-visual { position: relative; display: grid; min-height: 190px; place-items: center; background: #f2f1ef; }
.product-visual.season-winter { background: #edf2f2; }
.product-visual.season-all-season { background: #f3f0ea; }
.tire-shape { width: 112px; height: 112px; border: 20px solid #25292b; border-radius: 50%; box-shadow: inset 0 0 0 8px #4d5355, 0 10px 12px rgb(0 0 0 / 17%); transform: rotate(-18deg); }
.tire-shape::after { display: block; width: 32px; height: 32px; margin: 20px auto; border: 6px solid #b7b6b0; border-radius: 50%; content: ''; }
.product-season { position: absolute; top: 16px; right: 16px; padding: 7px 10px; border-radius: 14px; background: rgb(255 255 255 / 72%); color: #4e555a; font-size: 11px; }
.product-card-body { padding: 20px; }
.product-title-row { display: flex; align-items: start; justify-content: space-between; gap: 12px; }
.product-brand { margin: 0 0 5px; color: #ef552c; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.product-card h2 { margin: 0; color: #19232b; font-size: 19px; font-weight: 600; letter-spacing: -.5px; }
.product-stock { color: #4d7a54; font-size: 11px; white-space: nowrap; }
.product-spec { margin: 16px 0 22px; color: #697177; font-size: 13px; }
.product-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.product-footer strong { color: #19232b; font-size: 21px; font-weight: 600; }
.product-footer button, .catalog-empty button { border: 0; border-radius: 22px; background: #161b20; color: #fff; cursor: pointer; font-size: 12px; font-weight: 600; }
.product-footer button { padding: 11px 14px; }
.product-footer button:hover, .catalog-empty button:hover { background: #3b4248; }
.catalog-empty { margin-top: 24px; padding: 80px 20px; border: 1px solid #ededed; border-radius: 28px; text-align: center; }
.catalog-empty-mark { color: #ef552c; font-size: 42px; }
.catalog-empty h2 { margin: 18px 0 8px; color: #19232b; font-size: 25px; }
.catalog-empty p { margin: 0 0 22px; color: #697177; }
.catalog-empty button { padding: 13px 18px; }
@media (max-width: 800px) {
    .catalog-shell { padding: 0; }
    .catalog-card { min-height: 100vh; border-radius: 0; }
    .catalog-nav { grid-template-columns: 1fr auto; padding: 18px 20px; }
    .catalog-nav-links { grid-column: 1 / -1; grid-row: 2; justify-content: flex-start; gap: 20px; }
    .catalog-nav-actions { gap: 8px; }
    .catalog-content { width: min(100% - 40px, 1180px); padding: 52px 0 65px; }
    .catalog-heading { align-items: start; flex-direction: column; }
    .catalog-toolbar { grid-template-columns: 1fr 1fr; }
    .search-field { grid-column: 1 / -1; }
    .product-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 520px) {
    .catalog-nav-links { gap: 15px; }
    .catalog-nav-link { font-size: 13px; }
    .catalog-heading h1 { font-size: 50px; letter-spacing: -2.5px; }
    .catalog-heading p:last-child { font-size: 15px; }
    .catalog-result-count { align-self: flex-end; }
    .catalog-toolbar { grid-template-columns: 1fr; }
    .search-field { grid-column: auto; }
    .product-grid { grid-template-columns: 1fr; }
}
</style>
