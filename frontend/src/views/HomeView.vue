<template>
    <main class="home-shell">
        <section class="home-card">
            <nav class="site-nav" aria-label="Main navigation">
                <RouterLink class="brand" to="/" aria-label="E-Catalog home">
                    <span class="brand-mark" aria-hidden="true"></span>
                    <span>E-Catalog</span>
                </RouterLink>

                <div class="nav-links">
                    <RouterLink class="nav-link active" to="/">Home</RouterLink>
                    <RouterLink class="nav-link" to="/catalog">Catalog</RouterLink>
                    <RouterLink class="nav-link" to="/about">About</RouterLink>
                </div>

                <div class="nav-actions">
                    <RouterLink class="header-link" to="/catalog">Catalog</RouterLink>
	                <AuthNav />
                </div>
            </nav>

            <section id="catalog" class="hero-section" aria-labelledby="home-title">
                <p class="hero-eyebrow">Your product space</p>
                <h1 id="home-title">Everything you need,<br />in one catalog.</h1>
                <p class="hero-description">Explore products, compare options, and find what fits your world.</p>
                <div class="hero-actions">
                    <RouterLink class="hero-button primary" to="/register">Get Started</RouterLink>
                    <RouterLink class="hero-button secondary" to="/about">Learn More</RouterLink>
                </div>
            </section>     
            <section id="about" class="hero-next-section" aria-label="About E-Catalog"></section>
            <AppFooter />
        </section>
    </main>
</template>
<script setup>
import AuthNav from '../components/AuthNav.vue'
import AppFooter from '../components/AppFooter.vue'   
</script>