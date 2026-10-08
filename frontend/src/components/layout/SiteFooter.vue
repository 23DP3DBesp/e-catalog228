<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <div><strong>E-Catalog Tires</strong><p>Pārdomāta izvēle katram ceļam.</p></div>
      <nav aria-label="Kājenes navigācija"><RouterLink to="/catalog">Riepu katalogs</RouterLink><RouterLink to="/about">Par mums</RouterLink></nav>
      <span class="footer-meta">© {{ new Date().getFullYear() }} E-Catalog Tires · Latviešu</span>
    </div>
  </footer>
</template>
