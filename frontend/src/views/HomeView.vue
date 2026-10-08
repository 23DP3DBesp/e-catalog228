<script setup>
import { ArrowRight, ArrowUpRight, Sun, Snowflake, CloudSun, Search, SlidersHorizontal, Info, Sparkles, CircleCheck } from '@lucide/vue'
import TireSearch from '../components/home/TireSearch.vue'
import { products } from '../data/products'
import { formatPrice } from '../utils/format'
const tireImage = `${import.meta.env.BASE_URL}images/tire-studio.jpg`
// Editorial demo selection, not a real-world popularity ranking.
const featured = products.slice(0, 4)
const categories = [
  { value: 'summer', title: 'Vasaras riepas', description: 'Tavai siltās sezonas ikdienai.', icon: Sun, number: '01' },
  { value: 'winter', title: 'Ziemas riepas', description: 'Izvēle aukstajai sezonai.', icon: Snowflake, number: '02' },
  { value: 'all-season', title: 'Vissezonas riepas', description: 'Viens komplekts dažādām sezonām.', icon: CloudSun, number: '03' },
]
const benefits = [
  { icon: Search, title: 'Ērta meklēšana', text: 'Sāc ar izmēru vai apskati automašīnas meklēšanas piemēru.' },
  { icon: SlidersHorizontal, title: 'Tava izvēle, tavi kritēriji', text: 'Atlasi sezonu un sakārto piedāvājumu pēc cenas.' },
  { icon: Info, title: 'Saprotama informācija', text: 'Izmērs, sezona un indeksi — vienuviet un pārskatāmi.' },
  { icon: CircleCheck, title: 'Caurspīdīga pieeja', text: 'Demonstrācijas dati ir skaidri atzīmēti. Bez izdomātiem solījumiem.' },
]
</script>
<template>
  <main class="discovery-home">
    <div class="container">
      <section class="discovery-hero" aria-labelledby="home-title">
        <div class="hero-copy">
          <p class="hero-eyebrow"><span></span> Tavs nākamais ceļš sākas šeit</p>
          <h1 id="home-title">Atrodi savam auto piemērotākās <span>riepas.</span></h1>
          <p class="hero-intro">Mazāk minējumu. Vairāk pārliecības. Izpēti riepu īpašības un atrodi savam auto, sezonai un budžetam atbilstošu izvēli.</p>
          <div class="discovery-actions"><a href="#tire-search" class="hero-button primary">Meklēt riepas<ArrowRight :size="18" aria-hidden="true" /></a><RouterLink to="/catalog" class="text-link">Izpētīt katalogu<ArrowUpRight :size="17" aria-hidden="true" /></RouterLink></div>
          <p class="hero-footnote">Vieglajiem auto <span>·</span> Visām sezonām <span>·</span> Vienuviet</p>
        </div>
        <figure class="hero-visual">
          <div class="visual-kicker"><span>IZVĒLE KATRAM CEĻAM</span><CircleCheck :size="20" aria-hidden="true" /></div>
          <img :src="tireImage" alt="Neitrālas riepas studijas ilustrācija" width="1254" height="1254" fetchpriority="high" />
          <figcaption><span>Viss sākas ar pareizo izmēru.</span><small>Ilustratīvs attēls</small></figcaption>
        </figure>
      </section>
      <TireSearch />
      <section class="home-section" aria-labelledby="seasons-title">
        <div class="section-heading"><div><p class="section-eyebrow">Katram gadalaikam</p><h2 id="seasons-title">Tava sezona. Tavas riepas.</h2></div><span class="section-note">Izvēlies, ar ko sākt.</span></div>
        <div class="season-grid">
          <RouterLink v-for="category in categories" :key="category.value" :to="{path:'/catalog',query:{season:category.value}}" class="season-card">
            <div class="season-top"><component :is="category.icon" :size="25" :stroke-width="1.5" aria-hidden="true" /><span>{{ category.number }}</span></div>
            <h3>{{ category.title }}</h3><p>{{ category.description }}</p><span class="season-bottom">Apskatīt riepas<ArrowUpRight :size="20" aria-hidden="true" /></span>
          </RouterLink>
        </div>
      </section>
      <section class="home-section featured-section" aria-labelledby="featured-title">
        <div class="section-heading"><div><p class="section-eyebrow">Iepazīsti piedāvājumu</p><h2 id="featured-title">Modeļi, ar kuriem sākt.</h2></div><RouterLink class="text-link" to="/catalog">Visas riepas<ArrowRight :size="18" aria-hidden="true" /></RouterLink></div>
        <p class="section-description">Redakcionāla demonstrācijas izlase — nevis popularitātes reitings. Cenas ir piemēri, attēli ir ilustratīvi.</p>
        <div class="featured-grid">
          <article v-for="product in featured" :key="product.id" class="featured-card">
            <RouterLink :to="{path:'/catalog',query:{q:product.brand+' '+product.model}}" :aria-label="`Apskatīt ${product.brand} ${product.model}`" class="featured-image"><span>{{ product.seasonLabel }}</span><img :src="tireImage" alt="" width="1254" height="1254" loading="lazy" /></RouterLink>
            <div class="featured-body"><p class="featured-brand">{{ product.brand }}</p><h3>{{ product.model }}</h3><p class="featured-size">{{ product.size }} · {{ product.loadIndex }}{{ product.speedIndex }}</p><div class="featured-price"><div><small>Demo cena / gab.</small><strong>{{ formatPrice(product.price) }}</strong></div><RouterLink class="icon-button" :to="{path:'/catalog',query:{q:product.brand+' '+product.model}}" :aria-label="`Apskatīt ${product.brand} ${product.model} katalogā`"><ArrowUpRight :size="22" aria-hidden="true" /></RouterLink></div></div>
          </article>
        </div>
      </section>
      <section class="selection-guide" aria-labelledby="guide-title">
        <div class="guide-copy"><p class="section-eyebrow">Soli pa solim</p><h2 id="guide-title">Nezini, kuras riepas izvēlēties?</h2><p>Sāc ar trim lietām: apstiprināto riepu izmēru, sezonu un savu budžetu. Pēc tam izpēti katalogā pieejamos modeļus.</p><a href="#tire-search" class="hero-button primary">Sākt riepu meklēšanu<ArrowRight :size="18" aria-hidden="true" /></a><div class="upcoming"><Sparkles :size="16" aria-hidden="true" />AI asistents — plānots nākamajā izstrādes posmā.</div></div>
        <ol class="guide-steps"><li><span>01</span><div><h3>Pārbaudi izmēru</h3><p>Apskati automašīnas dokumentāciju un riepas sāna marķējumu.</p></div></li><li><span>02</span><div><h3>Izvēlies sezonu</h3><p>Padomā, kādos laikapstākļos un ceļa apstākļos brauksi.</p></div></li><li><span>03</span><div><h3>Izpēti modeļus</h3><p>Salīdzini izmērus un cenu piemērus, pielāgojot izvēli savam budžetam.</p></div></li></ol>
      </section>
      <section class="home-section benefits-section" aria-labelledby="benefits-title"><div class="section-heading"><div><p class="section-eyebrow">Mazāk sarežģījumu</p><h2 id="benefits-title">Pārdomāta izvēle sākas ar skaidrību.</h2></div></div><div class="benefits-grid"><article v-for="benefit in benefits" :key="benefit.title"><component :is="benefit.icon" :size="24" :stroke-width="1.5" aria-hidden="true" /><h3>{{ benefit.title }}</h3><p>{{ benefit.text }}</p></article></div></section>
    </div>
  </main>
</template>
<style scoped>
.discovery-hero { display: grid; grid-template-columns: 1.08fr 1fr; align-items: center; gap: 48px; padding-block: 64px 48px; }
.hero-copy { padding-block: 24px; }.hero-copy .hero-eyebrow { display: flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: .12em; }.hero-eyebrow span { width: 6px; height: 6px; background: var(--color-accent); border-radius: 50%; }
h1 { margin: 0; max-width: 660px; font-size: clamp(44px,4.65vw,68px); line-height: 1.06; letter-spacing: -.055em; font-weight: 600; }h1 span { color: var(--color-accent-hover); }
.hero-intro { max-width: 470px; margin: 24px 0 28px; color: var(--color-secondary); font-size: 16px; }.discovery-actions { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }.text-link { display: inline-flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; min-height: 44px; }.text-link:hover { color: var(--color-accent-hover); }
.hero-footnote { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; font-size: 11px; color: var(--color-secondary); }.hero-footnote span { color: #b4b4bb; }
.hero-visual { position: relative; margin: 0; border-radius: 20px; background: #f8f9fa; overflow: hidden; }.hero-visual img { display: block; width: 100%; height: auto; aspect-ratio: 1; object-fit: contain; padding: 36px 32px; mix-blend-mode: multiply; }.visual-kicker { position: absolute; inset: 24px 24px auto; display: flex; justify-content: space-between; align-items: center; color: #52525b; font-size: 9px; letter-spacing: .13em; }.hero-visual figcaption { position: absolute; inset: auto 24px 20px; display: flex; justify-content: space-between; gap: 8px; font-size: 10px; }.hero-visual small { color: var(--color-secondary); }
.home-section { margin-top: 80px; }.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 24px; }.section-eyebrow { color: var(--color-secondary); font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .14em; margin: 0 0 12px; }h2 { margin: 0; font-size: clamp(26px,2.6vw,36px); line-height: 1.2; letter-spacing: -.04em; font-weight: 600; }.section-note,.section-description { color: var(--color-secondary); font-size: 12px; }.section-description { margin: -8px 0 24px; }
.season-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 20px; }.season-card { border: 1px solid var(--color-border); border-radius: 16px; padding: 24px; transition: border-color .18s, transform .18s; }.season-card:hover { border-color: #aaa; transform: translateY(-2px); }.season-card:nth-child(2) { background: #f8f9fa; }.season-top { display: flex; justify-content: space-between; align-items: center; }.season-top > span { color: var(--color-secondary); font-size: 11px; }.season-card h3 { margin: 28px 0 8px; font-size: 21px; font-weight: 600; letter-spacing: -.6px; }.season-card p { color: var(--color-secondary); font-size: 13px; margin: 0; }.season-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 32px; font-size: 12px; font-weight: 600; }
.featured-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 20px; }.featured-card { border: 1px solid var(--color-border); border-radius: 16px; overflow: hidden; }.featured-image { display: block; position: relative; background: #f8f9fa; }.featured-image img { display: block; width: 100%; height: 220px; object-fit: contain; padding: 30px; mix-blend-mode: multiply; }.featured-image > span { position: absolute; left: 12px; top: 12px; padding: 5px 8px; border-radius: 6px; background: white; font-size: 9px; z-index: 1; }.featured-body { padding: 20px; }.featured-brand { margin: 0 0 8px; color: var(--color-secondary); font-size: 10px; text-transform: uppercase; letter-spacing: .08em; }.featured-body h3 { min-height: 46px; margin: 0; font-size: 18px; letter-spacing: -.5px; line-height: 1.3; }.featured-size { font-size: 12px; color: var(--color-secondary); margin: 12px 0 20px; }.featured-price { display: flex; justify-content: space-between; align-items: end; gap: 8px; border-top: 1px solid var(--color-border); padding-top: 16px; }.featured-price small { display: block; color: var(--color-secondary); font-size: 10px; margin-bottom: 6px; }.featured-price strong { font-size: 21px; letter-spacing: -.7px; }.featured-price .icon-button { border-color: var(--color-border); flex-shrink: 0; }
.selection-guide { margin-top: 80px; background: #f8f9fa; border: 1px solid var(--color-border); border-radius: 20px; padding: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }.guide-copy > p:not(.section-eyebrow) { color: var(--color-secondary); font-size: 14px; margin: 20px 0 24px; }.upcoming { display: flex; align-items: center; gap: 8px; margin-top: 20px; color: var(--color-secondary); font-size: 11px; }.upcoming svg { flex-shrink: 0; }.guide-steps { display: grid; gap: 24px; margin: 0; padding: 0; list-style: none; }.guide-steps li { display: flex; gap: 20px; border-bottom: 1px solid var(--color-border); padding-bottom: 24px; }.guide-steps li:last-child { border: 0; padding: 0; }.guide-steps li > span { padding-top: 3px; color: var(--color-accent-hover); font-size: 12px; }.guide-steps h3 { margin: 0 0 8px; font-size: 17px; font-weight: 600; }.guide-steps p { margin: 0; color: var(--color-secondary); font-size: 13px; }.benefits-section { margin-bottom: 80px; }.benefits-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 32px; padding-top: 16px; }.benefits-grid h3 { margin: 20px 0 10px; font-size: 15px; font-weight: 600; }.benefits-grid p { margin: 0; font-size: 13px; color: var(--color-secondary); }
@media(max-width: 1024px) { .discovery-hero { gap: 24px; }h1 { font-size: 48px; }.featured-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }.selection-guide { gap: 32px; padding: 32px; }.benefits-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
@media(max-width: 760px) { .discovery-hero { grid-template-columns: 1fr; padding-top: 24px; gap: 16px; }.hero-copy { padding-bottom: 0; }h1 { max-width: 580px; }.hero-intro { max-width: 100%; }.hero-visual img { height: 360px; }.home-section,.selection-guide { margin-top: 56px; }.section-note { display: none; }.season-grid { grid-template-columns: 1fr; gap: 12px; }.season-card { padding: 20px; }.season-card h3 { margin-top: 16px; }.season-bottom { margin-top: 20px; }.selection-guide { grid-template-columns: 1fr; }.section-heading { align-items: start; }.benefits-section { margin-bottom: 56px; } }
@media(max-width: 480px) { h1 { font-size: 44px; }.hero-copy .hero-eyebrow { font-size: 9px; }.hero-intro { font-size: 14px; }.discovery-actions { gap: 12px; }.discovery-actions .hero-button { padding-inline: 16px; }.hero-footnote { gap: 8px; font-size: 10px; }.hero-visual img { height: 310px; }.hero-visual figcaption { flex-direction: column; gap: 4px; }.featured-grid { grid-template-columns: 1fr; }.featured-image img { height: 240px; }.featured-body h3 { min-height: 0; }.section-heading { flex-wrap: wrap; gap: 8px; }.selection-guide { padding: 24px; }.benefits-grid { gap: 24px 16px; } }
</style>
