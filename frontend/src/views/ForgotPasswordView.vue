<template>
	<main class="auth-shell">
		<section class="auth-card" aria-labelledby="forgot-title">
			<header class="auth-header">
				<RouterLink class="brand" to="/" aria-label="E-Catalog home">
					<span class="brand-mark" aria-hidden="true"></span>
					<span>E-Catalog</span>
				</RouterLink>
				<RouterLink class="header-link" to="/login">Sign In</RouterLink>
			</header>

			<div class="auth-content">
				<h1 id="forgot-title">Reset password</h1>

				<form v-if="!sent" class="auth-form" @submit.prevent="submit">
					<p class="form-hint">Enter your email and we'll send you a link to choose a new password.</p>
					<label>
						<span class="visually-hidden">Email</span>
						<input v-model.trim="email" type="email" name="email" placeholder="Email" autocomplete="email" required />
					</label>
					<button type="submit" :disabled="loading">{{ loading ? 'Sending…' : 'Send reset link' }}</button>
				</form>

				<div v-else class="auth-form">
					<p class="form-success" role="status">If an account exists for {{ email }}, a reset link has been sent.</p>

					<!-- DEV ONLY: there is no email server yet, so the link is shown here -->
					<p v-if="DEV_SHOW_LINK && devLink" class="dev-note">
						Dev mode: <RouterLink :to="devLink">open the reset link</RouterLink>
					</p>

					<RouterLink class="forgot-link" to="/login">Back to sign in</RouterLink>
				</div>
			</div>
			<AppFooter />
		</section>
	</main>
</template>

<script setup>
import { ref } from 'vue'
import { requestPasswordReset } from '../stores/auth'
import AppFooter from '../components/AppFooter.vue'  
const DEV_SHOW_LINK = true 

const email = ref('')
const sent = ref(false)
const loading = ref(false)
const devLink = ref('')

async function submit() {
	if (loading.value) return
	loading.value = true
	try {
		const token = await requestPasswordReset(email.value)
		devLink.value = token ? `/reset-password?token=${token}` : ''
	} finally {

		sent.value = true
		loading.value = false
	}
}
</script>