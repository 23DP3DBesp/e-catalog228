<template>
	<div class="auth-nav">
		<template v-if="isLoggedIn">
			<RouterLink v-if="isAdmin" class="an-link" to="/admin">Admin</RouterLink>
			<RouterLink class="an-btn" to="/profile">Profile</RouterLink>
			<button class="an-ghost" type="button" @click="onLogout">Log out</button>
		</template>
		<template v-else>
			<RouterLink class="an-btn" to="/login">Sign In</RouterLink>
			<RouterLink class="an-btn" to="/register">Sign Up</RouterLink>
		</template>
	</div>
	
</template>

<script setup>
import { useRouter } from 'vue-router'
import { isLoggedIn, isAdmin, logout } from '../stores/auth'

const router = useRouter()

function onLogout() {
	logout()
	router.push('/')  
}
</script>

<style scoped>
.auth-nav { display: flex; align-items: center; gap: 14px; }
.an-link { color: #4e555a; font-size: 14px; text-decoration: none; }
.an-link:hover { color: #ef552c; }
.an-btn { padding: 10px 17px; border-radius: 22px; background: #161b20; color: #fff; font-size: 14px; text-decoration: none; transition: background .2s ease; }
.an-btn:hover { background: #3b4248; }
.an-ghost { padding: 9px 16px; border: 1px solid #dedede; border-radius: 22px; background: #fff; color: #19232b; font-size: 14px; cursor: pointer; transition: border-color .2s ease; }
.an-ghost:hover { border-color: #19232b; }

@media (max-width: 520px) {
	.auth-nav { gap: 8px; }
	.an-btn, .an-ghost { padding: 8px 12px; font-size: 13px; }
}
</style>