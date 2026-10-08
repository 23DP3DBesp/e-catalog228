<template>
	<p class="eyebrow">Admin</p>
	<h1 class="admin-title">Users</h1>

	<div class="stats">
		<div class="stat"><strong>{{ users.length }}</strong><span>Total users</span></div>
		<div class="stat"><strong>{{ adminCount }}</strong><span>Admins</span></div>
		<div class="stat"><strong>{{ blockedCount }}</strong><span>Blocked</span></div>
	</div>

	<section class="panel">
		<div class="panel-head">
			<h2>All users</h2>
			<div class="tools">
				<input v-model="search" type="search" class="search" placeholder="Search name or email…" aria-label="Search users" />
				<select v-model="roleFilter" aria-label="Filter by role">
					<option value="all">All roles</option>
					<option value="customer">Customers</option>
					<option value="admin">Admins</option>
				</select>
			</div>
		</div>

		<div class="table-wrap">
			<table v-if="visibleUsers.length">
				<thead>
					<tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th></th></tr>
				</thead>
				<tbody>
					<tr v-for="user in visibleUsers" :key="user.id">
						<td><strong>{{ user.name }}</strong><small>{{ user.email }}</small></td>
						<td>
							<select v-model="user.role" class="inline-select" :aria-label="`Role for ${user.name}`">
								<option value="customer">Customer</option>
								<option value="admin">Admin</option>
							</select>
						</td>
						<td><span class="tag" :class="user.status === 'active' ? 'green' : 'red'">{{ user.status === 'active' ? 'Active' : 'Blocked' }}</span></td>
						<td>{{ user.joined }}</td>
						<td class="row-actions">
							<button type="button" @click="toggleBlock(user)">{{ user.status === 'active' ? 'Block' : 'Unblock' }}</button>
							<button type="button" class="danger" @click="remove(user)">Delete</button>
						</td>
					</tr>
				</tbody>
			</table>
			<p v-else class="empty">No users found.</p>
		</div>
	</section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { users as seed } from '../../data/users'
import { usePersisted } from '../../composables/usePersisted'

const users = usePersisted('e-catalog-admin-users', () => seed.map((u) => ({ ...u })))
const search = ref('')
const roleFilter = ref('all')

const adminCount = computed(() => users.value.filter((u) => u.role === 'admin').length)
const blockedCount = computed(() => users.value.filter((u) => u.status === 'blocked').length)

const visibleUsers = computed(() => {
	const q = search.value.trim().toLowerCase()
	return users.value.filter((u) => {
		const matchesQuery = !q || `${u.name} ${u.email}`.toLowerCase().includes(q)
		const matchesRole = roleFilter.value === 'all' || u.role === roleFilter.value
		return matchesQuery && matchesRole
	})
})

function toggleBlock(user) {
	user.status = user.status === 'active' ? 'blocked' : 'active'
}

function remove(user) {
	if (!window.confirm(`Delete ${user.name}?`)) return
	users.value = users.value.filter((u) => u.id !== user.id)
}
</script>