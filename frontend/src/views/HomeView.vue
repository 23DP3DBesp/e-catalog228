<template>
    <main class="home-shell">
        <section class="home-card">

            <section id="catalog" class="hero-section" aria-labelledby="home-title">
                <p class="hero-eyebrow">Pārdomāta izvēle katram ceļam</p>
                <h1 id="home-title">Atrodi savam auto<br />piemērotākās riepas.</h1>
                <p class="hero-description">Izpēti riepu piedāvājumu un atrodi savam auto, sezonai un budžetam atbilstošu izvēli.</p>
                <div class="hero-actions">
                    <RouterLink class="hero-button primary" to="/catalog">Meklēt riepas</RouterLink>
                    <RouterLink class="hero-button secondary" to="/about">Par E-Catalog Tires</RouterLink>
                </div>
            </section>

            <section id="about" class="hero-next-section" aria-label="Par E-Catalog Tires"></section>
        </section>
    </main>
</template>