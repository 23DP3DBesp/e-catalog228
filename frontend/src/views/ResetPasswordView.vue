<template>
	<main class="auth-shell">
		<section class="auth-card" aria-labelledby="reset-title">
			<header class="auth-header">
				<RouterLink class="brand" to="/" aria-label="E-Catalog home">
					<span class="brand-mark" aria-hidden="true"></span>
					<span>E-Catalog</span>
				</RouterLink>
				<RouterLink class="header-link" to="/login">Sign In</RouterLink>
			</header>

			<div class="auth-content">
				<h1 id="reset-title">New password</h1>

				<form class="auth-form" @submit.prevent="submit">
					<label class="password-field">
						<span class="visually-hidden">New password</span>
						<input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="New password (min. 8 characters)" autocomplete="new-password" minlength="8" required />
						<span class="password-icon" role="button" tabindex="0" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword" @keydown.enter="showPassword = !showPassword">&#9673;</span>
					</label>

					<p v-if="error" class="form-error" role="alert">{{ error }}</p>

					<button type="submit" :disabled="loading">{{ loading ? 'Saving…' : 'Save password' }}</button>
					<RouterLink class="forgot-link" to="/forgot-password">Request a new link</RouterLink>
				</form>
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
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resetPassword } from '../stores/auth'

const route = useRoute()
const router = useRouter()

const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

async function submit() {
	if (loading.value) return
	error.value = ''
	loading.value = true
	try {
		await resetPassword(String(route.query.token ?? ''), password.value)
		router.push({ name: 'login', query: { reset: '1' } })
	} catch (e) {
		error.value = e.message
	} finally {
		loading.value = false
	}
}
</script>