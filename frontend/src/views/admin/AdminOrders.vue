<template>
	<p class="eyebrow">Admin</p>
	<h1 class="admin-title">Orders</h1>

	<div class="stats">
		<div class="stat"><strong>{{ orders.length }}</strong><span>Orders</span></div>
		<div class="stat"><strong>€{{ revenue }}</strong><span>Revenue (excl. cancelled)</span></div>
		<div class="stat"><strong>{{ openCount }}</strong><span>Need attention</span></div>
	</div>

	<section class="panel">
		<div class="panel-head">
			<h2>All orders</h2>
			<div class="tools">
				<input v-model="search" type="search" class="search" placeholder="Search order or customer…" aria-label="Search orders" />
				<select v-model="statusFilter" aria-label="Filter by status">
					<option value="all">All statuses</option>
					<option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
				</select>
			</div>
		</div>

		<div class="table-wrap">
			<table v-if="visibleOrders.length">
				<thead>
					<tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th></tr>
				</thead>
				<tbody>
					<template v-for="order in visibleOrders" :key="order.id">
						<tr class="clickable" @click="toggle(order.id)">
							<td><strong>{{ order.id }}</strong><small>{{ itemCount(order) }} items</small></td>
							<td><strong>{{ order.customer }}</strong><small>{{ order.email }}</small></td>
							<td>{{ order.date }}</td>
							<td @click.stop>
								<select v-model="order.status" class="inline-select" :aria-label="`Status for ${order.id}`">
									<option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
								</select>
							</td>
							<td><strong>€{{ orderTotal(order) }}</strong></td>
						</tr>
						<tr v-if="expandedId === order.id" class="details">
							<td colspan="5">
								<ul class="order-items">
									<li v-for="(item, i) in order.items" :key="i">
										<span>{{ item.name }} × {{ item.qty }}</span>
										<strong>€{{ item.qty * item.price }}</strong>
									</li>
								</ul>
							</td>
						</tr>
					</template>
				</tbody>
			</table>
			<p v-else class="empty">No orders found.</p>
		</div>
	</section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { orders as seed } from '../../data/orders'
import { usePersisted } from '../../composables/usePersisted'

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const orders = usePersisted('e-catalog-admin-orders', () => seed.map((o) => ({ ...o, items: o.items.map((i) => ({ ...i })) })))
const search = ref('')
const statusFilter = ref('all')
const expandedId = ref(null)

const orderTotal = (order) => order.items.reduce((sum, i) => sum + i.qty * i.price, 0)
const itemCount = (order) => order.items.reduce((sum, i) => sum + i.qty, 0)

const revenue = computed(() =>
	orders.value.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + orderTotal(o), 0),
)
const openCount = computed(() => orders.value.filter((o) => o.status === 'Pending' || o.status === 'Processing').length)

const visibleOrders = computed(() => {
	const q = search.value.trim().toLowerCase()
	return orders.value.filter((o) => {
		const matchesQuery = !q || `${o.id} ${o.customer} ${o.email}`.toLowerCase().includes(q)
		const matchesStatus = statusFilter.value === 'all' || o.status === statusFilter.value
		return matchesQuery && matchesStatus
	})
})

function toggle(id) {
	expandedId.value = expandedId.value === id ? null : id
}
</script>