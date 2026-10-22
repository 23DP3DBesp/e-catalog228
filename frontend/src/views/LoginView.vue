<script setup>
import { ref } from 'vue'
import UiButton from '../components/ui/UiButton.vue'
import { isDemoMode, signIn } from '../services/api.js'
const email = ref('')
const password = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')
async function submit() {
  error.value = ''
  message.value = ''
  if (isDemoMode) {
    message.value = 'Pierakstīšanās būs pieejama pēc servera pieslēgšanas.'
    return
  }
  loading.value = true
  try {
    const result = await signIn({ email: email.value, password: password.value })
    message.value = result.message || 'Pierakstīšanās izdevās.'
  } catch (cause) {
    error.value = cause.message
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <main class="auth-shell">
    <section class="auth-content" aria-labelledby="auth-title">
      <p class="hero-eyebrow">Mans konts</p>
      <h1 id="auth-title">Pierakstīties</h1>
      <form class="auth-form" @submit.prevent="submit">
        <label><span>E-pasts</span><input v-model.trim="email" type="email" name="email" autocomplete="email" required /></label>
        <label><span>Parole</span><input v-model="password" type="password" name="password" autocomplete="current-password" minlength="8" required /></label>
        <UiButton type="submit" :loading="loading">Pierakstīties</UiButton>
      </form>
      <p v-if="message" role="status" class="demo-notice">{{ message }}</p>
      <p v-if="error" role="alert" class="demo-notice">{{ error }}</p>
      <RouterLink class="auth-switch" to="/register">Nav konta? Reģistrēties</RouterLink>
    </section>
  </main>
</template>
