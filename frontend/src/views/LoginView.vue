<template>
	<main class="auth-shell">
		<section class="auth-card" aria-labelledby="login-title">
			<header class="auth-header">
				<RouterLink class="brand" to="/" aria-label="E-Catalog home">
					<span class="brand-mark" aria-hidden="true"></span>
					<span>E-Catalog</span>
				</RouterLink>
				<RouterLink class="header-link" to="/register">Sign Up</RouterLink>
			</header>

			<div class="auth-content">
				<h1 id="login-title">Sign In</h1>

				<p v-if="route.query.reset" class="form-success" role="status">Password updated. You can sign in now.</p>

				<form class="auth-form" @submit.prevent="submit">
					<label>
						<span class="visually-hidden">Email</span>
						<input v-model.trim="email" type="email" name="email" placeholder="Email" autocomplete="username" required />
					</label>

					<label class="password-field">
						<span class="visually-hidden">Password</span>
						<input v-model="password" :type="showPassword ? 'text' : 'password'" name="password" placeholder="Password" autocomplete="current-password" required />
						<span class="password-icon" role="button" tabindex="0" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword" @keydown.enter="showPassword = !showPassword">&#9673;</span>
					</label>

					<p v-if="error" class="form-error" role="alert">{{ error }}</p>

					<RouterLink class="forgot-link" to="/forgot-password">Forgot password?</RouterLink>
					<button type="submit" :disabled="loading">{{ loading ? 'Signing in…' : 'Sign In' }}</button>
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
		<AppFooter />
	</main>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../stores/auth'
import AppFooter from '../components/AppFooter.vue'   
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

async function submit() {
	if (loading.value) return
	error.value = ''
	loading.value = true
	try {
		const user = await login(email.value, password.value)
		
		const redirect = route.query.redirect
		const safe = typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
		router.push(safe ? redirect : user.role === 'admin' ? '/admin' : '/catalog')
	} catch (e) {
		error.value = e.message
	} finally {
		loading.value = false
	}
}
</script>