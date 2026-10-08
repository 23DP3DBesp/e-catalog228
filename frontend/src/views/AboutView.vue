<template>
    <main class="about-shell">
        <section class="about-card">
            <nav class="site-nav" aria-label="Main navigation">
                <RouterLink class="brand" to="/" aria-label="E-Catalog home">
                    <span class="brand-mark" aria-hidden="true"></span>
                    <span>E-Catalog</span>
                </RouterLink>
                

                <div class="nav-links">
                    <RouterLink class="nav-link" to="/">Home</RouterLink>
                    <RouterLink class="nav-link" to="/catalog">Catalog</RouterLink>
                    <RouterLink class="nav-link active" to="/about">About</RouterLink>
                </div>

                <div class="nav-actions">
                    <RouterLink class="header-link" to="/catalog">Catalog</RouterLink>
	                <AuthNav />
                </div>
            </nav>
            <section id="about" class="hero-section" aria-labelledby="about-title">
                <p class="hero-eyebrow">About E-Catalog</p>
                <h1 id="about-title"></h1>
                <p class="hero-description">E-Catalog is a modern online tire catalog designed to make finding the right tires simple and convenient. Users can browse and compare tires by size, brand, season, vehicle type, and other key specifications. The platform provides clear product information and an easy-to-use search system, helping drivers quickly find tires that match their vehicle and driving needs. Our goal is to simplify tire selection by bringing all essential information together in one clean and accessible platform.</p>
                <p>Our adress: ......</p>
                <p>Contanct number: ......</p>
            </section>

            <section id="contact" class="hero-next-section" aria-label="Contact E-Catalog"><AppFooter /></section>
        </section>
        
    </main>
</template>
<script setup>
import AuthNav from '../components/AuthNav.vue'
import AppFooter from '../components/AppFooter.vue'    
</script>