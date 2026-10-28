<script setup>
import TireSearch from '../components/home/TireSearch.vue'
</script>

<template>
  <main class="container finder-page">
    <nav class="breadcrumbs" aria-label="Atrašanās vieta">
      <RouterLink to="/">Sākums</RouterLink><span aria-hidden="true">/</span><span>Riepu izvēles palīgs</span>
    </nav>
    <header class="finder-heading">
      <p class="section-kicker">Riepu izvēles palīgs</p>
      <h1>Atrodi piemērotās riepas</h1>
      <p>Izvēlies riepu izmēru vai norādi savu automašīnu, un mēs parādīsim atbilstošos piedāvājumus katalogā.</p>
    </header>
    <TireSearch />
    <p class="finder-hint">Vai ir jautājumi? Uzdod tos riepu čatam apakšējā labajā stūrī.</p>
  </main>
</template>

<style scoped>
.finder-page{padding-block:32px 80px}
.breadcrumbs{display:flex;gap:12px;color:var(--color-secondary);font-size:12px}
.finder-heading{margin:40px 0 28px}
.section-kicker{margin:0 0 10px;color:var(--color-accent-hover);font-size:10px;letter-spacing:.14em;text-transform:uppercase}
.finder-heading h1{margin:0;font-size:clamp(36px,4vw,52px);letter-spacing:-.05em}
.finder-heading p:last-child{margin:12px 0 0;color:var(--color-secondary);font-size:14px;max-width:560px}
.finder-hint{margin:24px 0 0;color:var(--color-secondary);font-size:13px}
</style>
