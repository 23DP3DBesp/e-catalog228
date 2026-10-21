<script setup>
import { ref } from 'vue'
import UiButton from '../components/ui/UiButton.vue'
const submitted = ref(false)
</script>
<template>
  <main class="auth-shell">
    <section class="auth-content" aria-labelledby="auth-title">
      <p class="hero-eyebrow">Mans konts</p>
      <h1 id="auth-title">Pierakstīties</h1>
      <form class="auth-form" @submit.prevent="submitted = true">
        <label><span>E-pasts</span><input type="email" name="email" autocomplete="email" required /></label>
<label><span>Parole</span><input type="password" name="password" autocomplete="current-password" required /></label>
        <UiButton type="submit">Pierakstīties</UiButton>
      </form>
      <p v-if="submitted" role="status" class="demo-notice">Pierakstīšanās vēl nedarbojas.</p>
      <RouterLink class="auth-switch" to="/register">Nav konta? Reģistrēties</RouterLink>
    </section>
  </main>
</template>
