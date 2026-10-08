<template>
    <main class="catalog-shell">
        <section class="catalog-card">

            <div class="catalog-content">
                <header class="catalog-heading">
                    <div>
                        <p class="catalog-eyebrow">Riepu katalogs</p>
                        <h1>Atrodi savas riepas.</h1>
                        <p>Izvēlies riepas savam auto, braukšanas paradumiem un sezonai.</p>
                    </div>
                    <div class="catalog-result-count" aria-live="polite">
                        <strong>{{ filteredProducts.length }}</strong>
                        <span>atrastas riepas</span>
                    </div>
                </header>

                <p class="demo-notice">Demonstrācijas katalogs: cenas un pieejamība nav reāli veikalu piedāvājumi.</p>

                <div id="filters" class="catalog-toolbar">
                    <label class="search-field">
                        <span class="search-icon" aria-hidden="true">⌕</span>
                        <span class="visually-hidden">Meklēt riepas</span>
                        <input v-model="searchQuery" type="search" placeholder="Meklēt pēc modeļa vai ražotāja" />
                    </label>
                    <label class="filter-select">
                        <span class="visually-hidden">Atlasīt pēc sezonas</span>
                        <select v-model="seasonFilter">
                            <option value="all">Visas sezonas</option>
                            <option value="summer">Vasaras riepas</option>
                            <option value="winter">Ziemas riepas</option>
                            <option value="all-season">Vissezonas riepas</option>
                        </select>
                    </label>
                    <label class="filter-select">
                        <span class="visually-hidden">Kārtot riepas</span>
                        <select v-model="sortOrder">
                            <option value="featured">Sākotnējā secība</option>
                            <option value="price-low">Cena: no zemākās</option>
                            <option value="price-high">Cena: no augstākās</option>
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
                            <p class="product-spec">{{ product.size }} · slodzes indekss {{ product.loadIndex }} · ātruma indekss {{ product.speedIndex }}</p>
                            <div class="product-footer">
                                <strong>{{ formatPrice(product.price) }}</strong>
                                <button type="button" @click="addToCart(product)">{{ addedProductId === product.id ? 'Pievienots' : 'Pievienot grozam' }}</button>
                            </div>
                        </div>
                    </article>
                </div>

                <section v-else class="catalog-empty" aria-live="polite">
                    <span class="catalog-empty-mark" aria-hidden="true">⌕</span>
                    <h2>No atrastas riepas</h2>
                    <p>Izmēģini citu modeli, ražotāju vai sezonu.</p>
                    <button type="button" @click="clearFilters">Notīrīt filtrus</button>
                </section>
            </div>
        </section>
    </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { addToCart as addCartItem } from '../stores/cart'

import { products } from '../data/products'
import { formatPrice } from '../utils/format'

const searchQuery = ref('')
const seasonFilter = ref('all')
const sortOrder = ref('featured')
const addedProductId = ref(null)

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
    addCartItem(product)
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
.catalog-shell { padding: 0; background: var(--color-bg); }
.catalog-card {   background: #fff;  overflow: hidden; }
.catalog-content { width: min(100% - 40px, 1180px); margin: auto; padding: 68px 0 90px; }
.catalog-heading { display: flex; align-items: end; justify-content: space-between; gap: 32px; }
.catalog-eyebrow { margin: 0 0 17px; color: var(--color-accent-hover); font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.catalog-heading h1 { margin: 0; color: var(--color-text); font-size: clamp(48px, 6vw, 78px); font-weight: 400; letter-spacing: -3.8px; line-height: .96; }
.catalog-heading p:last-child { max-width: 480px; margin: 22px 0 0; color: var(--color-secondary); font-size: 17px; line-height: 1.5; }
.catalog-result-count { display: flex; align-items: end; gap: 8px; padding-bottom: 5px; color: #858585; font-size: 13px; white-space: nowrap; }
.catalog-result-count strong { color: var(--color-text); font-size: 30px; font-weight: 500; }
.catalog-toolbar { display: grid; grid-template-columns: 1fr 175px 175px; gap: 12px; margin-top: 55px; }
.search-field, .filter-select { display: flex; align-items: center; border: 1px solid #dedede; border-radius: var(--radius); background: #fff; }
.search-field { padding: 0 20px; }
.search-icon { margin-right: 10px; color: var(--color-accent-hover); font-size: 25px; line-height: 1; }
.search-field input, .filter-select select { width: 100%; border: 0; outline: 0; background: transparent; color: var(--color-text); font-size: 14px; }
.search-field input { padding: 16px 0; }
.search-field input::placeholder { color: #858585; }
.filter-select { padding: 0 16px; }
.filter-select select { padding: 16px 0; cursor: pointer; }
.product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 24px; }
.product-card { overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius); background: #fff; transition: transform .2s ease, box-shadow .2s ease; }
.product-card:hover { transform: translateY(-3px); box-shadow: 0 16px 30px rgb(25 35 43 / 10%); }
.product-visual { position: relative; display: grid; min-height: 190px; place-items: center; background: #f2f1ef; }
.product-visual.season-winter { background: #edf2f2; }
.product-visual.season-all-season { background: #f3f0ea; }
.tire-shape { width: 112px; height: 112px; border: 20px solid #25292b; border-radius: 50%; box-shadow: inset 0 0 0 8px #4d5355, 0 10px 12px rgb(0 0 0 / 17%); transform: rotate(-18deg); }
.tire-shape::after { display: block; width: 32px; height: 32px; margin: 20px auto; border: 6px solid #b7b6b0; border-radius: 50%; content: ''; }
.product-season { position: absolute; top: 16px; right: 16px; padding: 7px 10px; border-radius: 14px; background: rgb(255 255 255 / 72%); color: #4e555a; font-size: 11px; }
.product-card-body { padding: 20px; }
.product-title-row { display: flex; align-items: start; justify-content: space-between; gap: 12px; }
.product-brand { margin: 0 0 5px; color: var(--color-accent-hover); font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.product-card h2 { margin: 0; color: var(--color-text); font-size: 19px; font-weight: 600; letter-spacing: -.5px; }
.product-stock { color: #4d7a54; font-size: 11px; white-space: nowrap; }
.product-spec { margin: 16px 0 22px; color: var(--color-secondary); font-size: 13px; }
.product-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.product-footer strong { color: var(--color-text); font-size: 21px; font-weight: 600; }
.product-footer button, .catalog-empty button { border: 0; border-radius: 22px; background: #161b20; color: #fff; cursor: pointer; font-size: 12px; font-weight: 600; }
.product-footer button { padding: 11px 14px; }
.product-footer button:hover, .catalog-empty button:hover { background: #3b4248; }
.catalog-empty { margin-top: 24px; padding: 80px 20px; border: 1px solid var(--color-border); border-radius: var(--radius); text-align: center; }
.catalog-empty-mark { color: var(--color-accent-hover); font-size: 42px; }
.catalog-empty h2 { margin: 18px 0 8px; color: var(--color-text); font-size: 25px; }
.catalog-empty p { margin: 0 0 22px; color: var(--color-secondary); }
.catalog-empty button { padding: 13px 18px; }
@media (max-width: 800px) {
    .catalog-shell { padding: 0; }
    .catalog-card { border-radius: 0; }
    .catalog-content { width: min(100% - 40px, 1180px); padding: 52px 0 65px; }
    .catalog-heading { align-items: start; flex-direction: column; }
    .catalog-toolbar { grid-template-columns: 1fr 1fr; }
    .search-field { grid-column: 1 / -1; }
    .product-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 520px) {
    .catalog-heading h1 { font-size: 50px; letter-spacing: -2.5px; }
    .catalog-heading p:last-child { font-size: 15px; }
    .catalog-result-count { align-self: flex-end; }
    .catalog-toolbar { grid-template-columns: 1fr; }
    .search-field { grid-column: auto; }
    .product-grid { grid-template-columns: 1fr; }
}
</style>
