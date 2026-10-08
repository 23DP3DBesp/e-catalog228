<template>
	<p class="eyebrow">Admin</p>
	<h1 class="admin-title">Products</h1>

	<div class="stats">
		<div class="stat"><strong>{{ items.length }}</strong><span>Products</span></div>
		<div class="stat"><strong>€{{ totalPrice }}</strong><span>Total price of all items</span></div>
		<div class="stat"><strong>€{{ averagePrice }}</strong><span>Average price</span></div>
	</div>

	<div class="admin-grid">
		<section class="panel">
			<div class="panel-head">
				<h2>All products</h2>
				<input v-model="search" type="search" class="search" placeholder="Search…" aria-label="Search products" />
			</div>

			<div class="table-wrap">
				<table v-if="visibleItems.length">
					<thead>
						<tr><th>Product</th><th>Size</th><th>Season</th><th>Price</th><th></th></tr>
					</thead>
					<tbody>
						<tr v-for="item in visibleItems" :key="item.id" :class="{ editing: item.id === editingId }">
							<td><strong>{{ item.model }}</strong><small>{{ item.brand }}</small></td>
							<td>{{ item.size }}</td>
							<td><span class="tag" :class="seasonColor[item.season]">{{ item.seasonLabel }}</span></td>
							<td>€{{ item.price }}</td>
							<td class="row-actions">
								<button type="button" @click="edit(item)">Edit</button>
								<button type="button" class="danger" @click="remove(item)">Delete</button>
							</td>
						</tr>
					</tbody>
				</table>
				<p v-else class="empty">No products match your search.</p>
			</div>
		</section>

		<form class="panel" @submit.prevent="save">
			<h2>{{ editingId ? 'Edit product' : 'Add product' }}</h2>

			<label class="field"><span>Brand</span><input v-model.trim="form.brand" type="text" required /></label>
			<label class="field"><span>Model</span><input v-model.trim="form.model" type="text" required /></label>
			<label class="field"><span>Size</span><input v-model.trim="form.size" type="text" placeholder="205/55 R16" required /></label>

			<div class="row">
				<label class="field"><span>Load index</span><input v-model.trim="form.loadIndex" type="text" required /></label>
				<label class="field"><span>Speed index</span><input v-model.trim="form.speedIndex" type="text" required /></label>
			</div>

			<div class="row">
				<label class="field">
					<span>Season</span>
					<select v-model="form.season">
						<option value="summer">Summer</option>
						<option value="winter">Winter</option>
						<option value="all-season">All-season</option>
					</select>
				</label>
				<label class="field"><span>Price (€)</span><input v-model.number="form.price" type="number" min="0" step="1" required /></label>
			</div>

			<div class="form-actions">
				<button class="primary" type="submit">{{ editingId ? 'Save changes' : 'Add product' }}</button>
				<button v-if="editingId" class="ghost" type="button" @click="resetForm">Cancel</button>
				<span v-if="notice" class="notice" role="status">{{ notice }}</span>
			</div>
		</form>
	</div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { products } from '../../data/products'
import { usePersisted } from '../../composables/usePersisted'

const SEASON_LABELS = { summer: 'Summer', winter: 'Winter', 'all-season': 'All-season' }
const seasonColor = { summer: 'amber', winter: 'blue', 'all-season': 'green' }

const items = usePersisted('e-catalog-admin-products', () => products.map((p) => ({ ...p })))
const search = ref('')
const editingId = ref(null)
const notice = ref('')

const emptyForm = () => ({ brand: '', model: '', size: '', loadIndex: '', speedIndex: '', season: 'summer', price: 0 })
const form = reactive(emptyForm())

const visibleItems = computed(() => {
	const q = search.value.trim().toLowerCase()
	if (!q) return items.value
	return items.value.filter((p) => `${p.brand} ${p.model} ${p.size}`.toLowerCase().includes(q))
})

const totalPrice = computed(() => items.value.reduce((sum, p) => sum + p.price, 0))
const averagePrice = computed(() => (items.value.length ? Math.round(totalPrice.value / items.value.length) : 0))

function flash(text) {
	notice.value = text
	window.setTimeout(() => (notice.value = ''), 2000)
}

function resetForm() {
	Object.assign(form, emptyForm())
	editingId.value = null
}

function edit(item) {
	Object.assign(form, item)
	editingId.value = item.id
	window.scrollTo({ top: 0, behavior: 'smooth' })
}

function save() {
	const data = { ...form, seasonLabel: SEASON_LABELS[form.season] }
	if (editingId.value) {
		const index = items.value.findIndex((p) => p.id === editingId.value)
		if (index !== -1) items.value[index] = { ...data, id: editingId.value }
		flash('Saved ✓')
	} else {
		const nextId = items.value.reduce((max, p) => Math.max(max, p.id), 0) + 1
		items.value.push({ ...data, id: nextId })
		flash('Added ✓')
	}
	resetForm()
}

function remove(item) {
	if (!window.confirm(`Delete ${item.brand} ${item.model}?`)) return
	items.value = items.value.filter((p) => p.id !== item.id)
	if (editingId.value === item.id) resetForm()
}
</script>