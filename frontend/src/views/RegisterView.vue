<script setup>
import { ref } from 'vue'
import UiButton from '../components/ui/UiButton.vue'
import { isDemoMode, registerAccount } from '../services/api.js'
const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')
async function submit() {
  error.value = ''
  message.value = ''
  if (isDemoMode) {
    message.value = 'Konta izveide būs pieejama pēc servera pieslēgšanas.'
    return
  }
  loading.value = true
  try {
    const result = await registerAccount({ name: name.value, email: email.value, password: password.value })
    message.value = result.message || 'Konts ir izveidots.'
  } catch (cause) {
    error.value = cause.message
  } finally {
    loading.value = false
  }
}
console.log('Demo mode:', isDemoMode)
console.log('API mode:', import.meta.env.VITE_API_MODE)
</script>
<template>
  <main class="auth-shell">
    <section class="auth-content" aria-labelledby="auth-title">
      <p class="hero-eyebrow">Mans konts</p>
      <h1 id="auth-title">Izveidot kontu</h1>
      <form class="auth-form" @submit.prevent="submit">
        <label><span>Vārds</span><input v-model.trim="name" type="text" name="name" autocomplete="name" maxlength="100" required /></label>
        <label><span>E-pasts</span><input v-model.trim="email" type="email" name="email" autocomplete="email" required /></label>
        <label><span>Parole</span><input v-model="password" type="password" name="password" autocomplete="new-password" minlength="8" required /></label>
        <UiButton type="submit" :loading="loading">Izveidot kontu</UiButton>
      </form>
      <p v-if="message" role="status" class="demo-notice">{{ message }}</p>
      <p v-if="error" role="alert" class="demo-notice">{{ error }}</p>
      <RouterLink class="auth-switch" to="/login">Jau ir konts? Pierakstīties</RouterLink>
    </section>
  </main>
</template>
