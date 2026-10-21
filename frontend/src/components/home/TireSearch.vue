<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, CarFront, CircleDot, Info, ArrowRight } from '@lucide/vue'
import UiButton from '../ui/UiButton.vue'
import { vehicles, compatibilityNotice } from '../../data/vehicles'
import { products } from '../../data/products'
import { parseSize, seasons } from '../../utils/catalogSearch'

const router = useRouter()
const mode = ref('size')
const width = ref('')
const profile = ref('')
const diameter = ref('')
const season = ref('')
const brand = ref('')
const model = ref('')
const year = ref('')
const modification = ref('')
const unique = values => [...new Set(values)]
const sizes = products.map(p => parseSize(p.size))
const widths = unique([...sizes.map(s => s.width), '245']).sort()
const profiles = unique(sizes.map(s => s.profile)).sort()
const diameters = unique(sizes.map(s => s.diameter)).sort()
const brands = unique(vehicles.map(v => v.brand))
const models = computed(() => unique(vehicles.filter(v => v.brand === brand.value).map(v => v.model)))
const years = computed(() => unique(vehicles.filter(v => v.brand === brand.value && v.model === model.value).map(v => v.year)))
const modifications = computed(() => unique(vehicles.filter(v => v.brand === brand.value && v.model === model.value && v.year === year.value).map(v => v.modification)))
const vehicle = computed(() => vehicles.find(v => v.brand === brand.value && v.model === model.value && v.year === year.value && v.modification === modification.value))
watch(brand, () => { model.value = ''; year.value = ''; modification.value = '' })
watch(model, () => { year.value = ''; modification.value = '' })
watch(year, () => { modification.value = '' })
function search() {
  if (mode.value === 'vehicle' && !vehicle.value) return
  const dimensions = mode.value === 'vehicle' ? parseSize(vehicle.value.size) : { width: width.value, profile: profile.value, diameter: diameter.value }
  const query = Object.fromEntries(Object.entries({ ...dimensions, season: mode.value === 'size' ? season.value : '' }).filter(([, value]) => value))
  if (mode.value === 'vehicle') query.vehicle = 'demo'
  router.push({ path: '/catalog', query })
}
</script>
<template>
  <section id="tire-search" class="tire-search" aria-labelledby="search-title">
    <div class="search-top"><h2 id="search-title">Sāc ar piemērotu izmēru.</h2><span>01 / Riepu meklēšana</span></div>
    <div class="search-modes" role="group" aria-label="Meklēšanas veids">
      <button type="button" :aria-pressed="mode === 'size'" @click="mode = 'size'"><CircleDot :size="18" aria-hidden="true" />Pēc riepu izmēra</button>
      <button type="button" :aria-pressed="mode === 'vehicle'" @click="mode = 'vehicle'"><CarFront :size="18" aria-hidden="true" />Pēc automašīnas</button>
    </div>
    <form @submit.prevent="search">
      <div v-if="mode === 'size'" class="search-fields">
        <label>Platums<select v-model="width"><option value="">Jebkurš</option><option v-for="value in widths" :key="value">{{ value }}</option></select></label>
        <label>Profils<select v-model="profile"><option value="">Jebkurš</option><option v-for="value in profiles" :key="value">{{ value }}</option></select></label>
        <label>Diametrs<select v-model="diameter"><option value="">Jebkurš</option><option v-for="value in diameters" :key="value" :value="value">R{{ value }}</option></select></label>
        <label>Sezona<select v-model="season"><option value="">Visas sezonas</option><option v-for="item in seasons" :key="item.value" :value="item.value">{{ item.label }}</option></select></label>
        <UiButton type="submit"><Search :size="18" aria-hidden="true" />Meklēt riepas</UiButton>
      </div>
      <div v-else class="search-fields">
        <label>Ražotājs<select v-model="brand" required><option value="" disabled>Izvēlies ražotāju</option><option v-for="value in brands" :key="value">{{ value }}</option></select></label>
        <label>Modelis<select v-model="model" required :disabled="!brand"><option value="" disabled>Izvēlies modeli</option><option v-for="value in models" :key="value">{{ value }}</option></select></label>
        <label>Gads<select v-model="year" required :disabled="!model"><option value="" disabled>Izvēlies gadu</option><option v-for="value in years" :key="value">{{ value }}</option></select></label>
        <label>Modifikācija<select v-model="modification" required :disabled="!year"><option value="" disabled>Izvēlies versiju</option><option v-for="value in modifications" :key="value">{{ value }}</option></select></label>
        <UiButton type="submit" :disabled="!vehicle">Meklēt riepas<ArrowRight :size="18" aria-hidden="true" /></UiButton>
      </div>
      <p v-if="mode === 'size'" class="search-help"><Info :size="16" aria-hidden="true" />Izmēru atradīsi uz riepas sāna, piemēram, 205/55 R16.</p>
      <div v-else class="search-help vehicle-notice" aria-live="polite"><Info :size="16" aria-hidden="true" /><p><strong v-if="vehicle">Piemēra izmērs: {{ vehicle.size }}. </strong>{{ compatibilityNotice }} Pieejami četri demonstrācijas auto.</p></div>
    </form>
  </section>
</template>
<style scoped>
.tire-search { scroll-margin-top: 110px; border: 1px solid var(--color-border); border-radius: 18px; padding: 32px; background: white; box-shadow: 0 8px 32px #11111105; }
.search-top { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
h2 { margin: 0; font-size: 23px; letter-spacing: -.7px; }
.search-top > span { color: var(--color-secondary); font-size: 12px; }
.search-modes { display: flex; gap: 24px; border-bottom: 1px solid var(--color-border); margin: 20px 0 24px; }
.search-modes button { display: flex; align-items: center; gap: 8px; min-height: 48px; padding: 8px 0; border: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--color-secondary); font-size: 14px; }
.search-modes button[aria-pressed=true] { color: var(--color-text); border-bottom-color: var(--color-accent); }
.search-fields { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)) auto; gap: 16px; align-items: end; }
label { display: grid; gap: 8px; min-width: 0; font-size: 12px; font-weight: 600; }
select { width: 100%; min-width: 0; font-size: 14px; font-weight: 400; }
select:disabled { color: var(--color-secondary); background: var(--color-surface); }
.search-help { display: flex; align-items: center; gap: 8px; color: var(--color-secondary); font-size: 12px; margin: 20px 0 0; }
.search-help svg { flex-shrink: 0; }.search-help p { margin: 0; }.vehicle-notice { align-items: start; }
@media(max-width: 1024px) { .search-fields { grid-template-columns: repeat(2,minmax(0,1fr)); }.search-fields > button { grid-column: 1 / -1; } }
@media(max-width: 600px) { .tire-search { padding: 24px 16px; }.search-top > span { display: none; }h2 { font-size: 21px; }.search-modes { gap: 16px; }.search-modes button { font-size: 12px; }.search-fields { gap: 16px 12px; } }
</style>
