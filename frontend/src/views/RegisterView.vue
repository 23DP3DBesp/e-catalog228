<script setup>
import { ref } from 'vue'
import UiButton from '../components/ui/UiButton.vue'
const submitted = ref(false)
</script>
<template>
  <main class="auth-shell">
    <section class="auth-content" aria-labelledby="auth-title">
      <p class="hero-eyebrow">Mans konts</p>
      <h1 id="auth-title">Izveidot kontu</h1>
      <p class="demo-notice">Demonstrācijas forma. Autorizācija vēl nav pieejama; ievadītie dati netiek nosūtīti vai saglabāti. Izmantojiet tikai testa datus.</p>
      <form class="auth-form" @submit.prevent="submitted = true">
        <label><span>Vārds</span><input type="text" name="name" autocomplete="name" required /></label>
<label><span>E-pasts</span><input type="email" name="email" autocomplete="email" required /></label>
<label><span>Parole</span><input type="password" name="password" autocomplete="new-password" required /></label>
        <UiButton type="submit">Izveidot kontu</UiButton>
      </form>
      <p v-if="submitted" role="status" class="demo-notice">Forma aizpildīta. Šis ir demonstrācijas režīms — konts netiek izveidots un pierakstīšanās nenotiek.</p>
      <RouterLink class="auth-switch" to="/login">Jau ir konts? Pierakstīties</RouterLink>
    </section>
  </main>
</template>
