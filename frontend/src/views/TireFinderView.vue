<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight, RotateCcw } from '@lucide/vue'
import ProductCard from '../components/catalog/ProductCard.vue'
import UiButton from '../components/ui/UiButton.vue'
import { products } from '../data/products'
import { vehicles } from '../data/vehicles'
import { addToCart } from '../stores/cart'
import { useRouter } from 'vue-router'
import { useAuth } from '../services/auth.js'
import { parseSize } from '../utils/catalogSearch'
import { formatPrice } from '../utils/format'

const STORAGE_KEY = 'ecatalog-tire-finder'
const router = useRouter()
const { isAuthenticated } = useAuth()
const steps = ['Auto un izmērs', 'Sezona un cena', 'Braukšana', 'Rezultāts']
const seasons = [
  { value: 'summer', label: 'Vasaras riepas' },
  { value: 'winter', label: 'Ziemas riepas' },
  { value: 'all-season', label: 'Vissezonas riepas' },
]
const priorities = ['Cena', 'Drošība', 'Komforts', 'Mazāks troksnis', 'Ilgmūžība', 'Ekonomija']
const drivingStyles = ['Ikdienai', 'Pilsētai', 'Gariem braucieniem', 'Sportiskai braukšanai']

function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return saved && typeof saved === 'object' ? saved : {}
  } catch {
    return {}
  }
}

const saved = readSaved()
const step = ref(0)
const selectedVehicle = ref(saved.vehicle || '')
const tireSize = ref(saved.size || '')
const season = ref(saved.season || '')
const budget = ref(Number(saved.budget) || 150)
const drivingStyle = ref(saved.drivingStyle || '')
const selectedPriorities = ref(Array.isArray(saved.priorities) ? saved.priorities.slice(0, 3) : [])
const feedback = ref('')
const vehicleOptions = computed(() => vehicles.map(vehicle => ({
  ...vehicle,
  label: `${vehicle.brand} ${vehicle.model} (${vehicle.year}) — ${vehicle.modification}`,
})))
const selectedVehicleDetails = computed(() => vehicleOptions.value.find(vehicle => vehicle.label === selectedVehicle.value))
const parsedSize = computed(() => parseSize(tireSize.value.trim()))
const isSizeValid = computed(() => Object.keys(parsedSize.value).length === 3)
const canContinue = computed(() => {
  if (step.value === 0) return isSizeValid.value
  if (step.value === 1) return Boolean(season.value) && budget.value >= 40
  if (step.value === 2) return Boolean(drivingStyle.value) && selectedPriorities.value.length > 0
  return true
})
const recommendations = computed(() => products
  .filter(product => {
    const size = parseSize(product.size)
    return size.width === parsedSize.value.width
      && size.profile === parsedSize.value.profile
      && size.diameter === parsedSize.value.diameter
      && product.season === season.value
      && product.price <= Number(budget.value)
  })
  .sort((a, b) => recommendationScore(b) - recommendationScore(a) || a.price - b.price))

function recommendationScore(product) {
  const gradeScore = value => value ? 6 - value.charCodeAt(0) + 65 : 0
  return selectedPriorities.value.reduce((score, priority) => {
    if (priority === 'Cena') return score + (Number(budget.value) - product.price) / Number(budget.value) * 5
    if (priority === 'Drošība') return score + gradeScore(product.wet) * 2
    if (priority === 'Ekonomija') return score + gradeScore(product.fuel)
    if (priority === 'Mazāks troksnis' || priority === 'Komforts') return score + (product.noise == null ? 0 : Math.max(0, 76 - product.noise))
    return score
  }, 0)
}

watch([selectedVehicle, tireSize, season, budget, drivingStyle, selectedPriorities], () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      vehicle: selectedVehicle.value,
      size: tireSize.value,
      season: season.value,
      budget: budget.value,
      drivingStyle: drivingStyle.value,
      priorities: selectedPriorities.value,
    }))
  } catch {
    feedback.value = 'Neizdevās saglabāt izvēli pārlūkā.'
  }
}, { deep: true })

watch(selectedVehicle, value => {
  const match = vehicleOptions.value.find(vehicle => vehicle.label === value)
  if (match) tireSize.value = match.size
})

function togglePriority(priority) {
  if (selectedPriorities.value.includes(priority)) {
    selectedPriorities.value = selectedPriorities.value.filter(item => item !== priority)
  } else if (selectedPriorities.value.length < 3) {
    selectedPriorities.value = [...selectedPriorities.value, priority]
  }
}
function nextStep() {
  if (canContinue.value) step.value = Math.min(step.value + 1, steps.length - 1)
}
function previousStep() { step.value = Math.max(step.value - 1, 0) }
function startOver() {
  step.value = 0
  selectedVehicle.value = ''
  tireSize.value = ''
  season.value = ''
  budget.value = 150
  drivingStyle.value = ''
  selectedPriorities.value = []
  feedback.value = ''
}
function addProduct(product) {
  if (!product.available) return
  if (!isAuthenticated.value) { router.push({ name: 'login', query: { redirect: '/cart' } }); return }
  addToCart(product)
  feedback.value = `${product.brand} ${product.model} pievienota grozam.`
}
</script>

<template>
  <main class="container finder-page">
    <nav class="breadcrumbs" aria-label="Atrašanās vieta"><RouterLink to="/">Sākums</RouterLink><span aria-hidden="true">/</span><span>Riepu izvēles palīgs</span></nav>
    <header class="finder-heading"><h1>Riepu izvēles palīgs</h1><p>Atbildi uz dažiem jautājumiem, lai atrastu riepas savam auto.</p></header>

    <ol class="step-list" aria-label="Izvēles soļi">
      <li v-for="(label, index) in steps" :key="label" :class="{active: step === index, done: step > index}">
        <span>{{ step > index ? '✓' : index + 1 }}</span>{{ label }}
      </li>
    </ol>

    <section v-if="step === 0" class="finder-panel" aria-labelledby="step-title">
      <h2 id="step-title">Izvēlies auto vai ievadi riepu izmēru</h2>
      <label class="field">Auto piemērs
        <select v-model="selectedVehicle">
          <option value="">Izvēlēties vēlāk</option>
          <option v-for="vehicle in vehicleOptions" :key="vehicle.label" :value="vehicle.label">{{ vehicle.label }}</option>
        </select>
      </label>
      <label class="field">Riepu izmērs
        <input v-model.trim="tireSize" type="text" placeholder="Piemēram, 205/55 R16" autocomplete="off" />
      </label>
      <p class="form-help">Izmēru vari atrast uz riepas sāna vai auto dokumentos.</p>
      <p v-if="selectedVehicleDetails" class="notice">Auto norādītais izmērs ir piemērs. Pārbaudi to auto dokumentos.</p>
      <p v-else-if="tireSize && !isSizeValid" class="error-message" role="alert">Ievadi izmēru formātā 205/55 R16.</p>
    </section>

    <section v-else-if="step === 1" class="finder-panel" aria-labelledby="step-title">
      <h2 id="step-title">Kādai sezonai vajag riepas?</h2>
      <div class="choice-list" role="group" aria-label="Riepu sezona">
        <button v-for="option in seasons" :key="option.value" type="button" :aria-pressed="season === option.value" @click="season = option.value">{{ option.label }}</button>
      </div>
      <label class="field">Maksimālā cena par vienu riepu: {{ formatPrice(budget) }}
        <input v-model.number="budget" type="range" min="40" max="250" step="5" />
      </label>
      <label class="field">Budžets par riepu (€)
        <input v-model.number="budget" type="number" min="40" max="250" step="5" />
      </label>
    </section>

    <section v-else-if="step === 2" class="finder-panel" aria-labelledby="step-title">
      <h2 id="step-title">Kā tu parasti brauc?</h2>
      <div class="choice-list" role="group" aria-label="Braukšanas stils">
        <button v-for="style in drivingStyles" :key="style" type="button" :aria-pressed="drivingStyle === style" @click="drivingStyle = style">{{ style }}</button>
      </div>
      <h3>Kas tev ir svarīgs? Izvēlies līdz trim lietām.</h3>
      <div class="choice-list" role="group" aria-label="Svarīgākās īpašības">
        <button v-for="priority in priorities" :key="priority" type="button" :aria-pressed="selectedPriorities.includes(priority)" :disabled="selectedPriorities.length >= 3 && !selectedPriorities.includes(priority)" @click="togglePriority(priority)">{{ priority }}</button>
      </div>
    </section>

    <section v-else class="finder-panel results-panel" aria-labelledby="step-title">
      <div class="results-heading"><div><h2 id="step-title">Riepas, kas atbilst tavai izvēlei</h2><p>{{ tireSize }} · {{ seasons.find(option => option.value === season)?.label }} · līdz {{ formatPrice(budget) }} par riepu</p></div><button type="button" class="text-button" @click="startOver"><RotateCcw :size="16" aria-hidden="true" />Sākt no jauna</button></div>
      <p class="notice">Šīs ir katalogā atrastās riepas pēc norādītā izmēra, sezonas un cenas. Auto saderību pārbaudi dokumentos.</p>
      <div v-if="recommendations.length" class="recommendation-grid">
        <ProductCard v-for="product in recommendations" :key="product.id" :product="product" @add="addProduct" />
      </div>
      <div v-else class="no-results"><h3>Šiem kritērijiem riepas nav atrastas.</h3><p>Maini izmēru, sezonu vai cenu.</p><button type="button" class="text-button" @click="step = 0">Mainīt izvēli</button></div>
    </section>

    <p v-if="feedback" class="finder-feedback" role="status">{{ feedback }}</p>
    <div v-if="step < 3" class="step-actions">
      <button type="button" class="back-button" :disabled="step === 0" @click="previousStep"><ArrowLeft :size="16" aria-hidden="true" />Atpakaļ</button>
      <UiButton :disabled="!canContinue" @click="nextStep">{{ step === 2 ? 'Atrast riepas' : 'Tālāk' }}<ArrowRight :size="16" aria-hidden="true" /></UiButton>
    </div>
    <p class="sample-note">Riepas un cenas šajā katalogā ir piemēri.</p>
  </main>
</template>

<style scoped>
.finder-page { padding-block: 28px 64px; }
.breadcrumbs { display:flex; gap:10px; color:var(--color-secondary); font-size:12px; }
.breadcrumbs a { color:inherit; }
.finder-heading { margin:28px 0; }
.finder-heading h1 { margin:0; font-size:clamp(32px,4vw,44px); }
.finder-heading p { color:var(--color-secondary); }
.step-list { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:0 0 24px; padding:0; list-style:none; }
.step-list li { display:flex; align-items:center; gap:8px; color:var(--color-secondary); font-size:12px; }
.step-list li span { display:grid; width:26px; height:26px; place-items:center; border:1px solid var(--color-border); border-radius:50%; }
.step-list li.active { color:var(--color-text); font-weight:600; }
.step-list li.active span,.step-list li.done span { border-color:var(--color-accent); background:var(--color-accent); color:white; }
.finder-panel { padding:24px; border:1px solid var(--color-border); border-radius:var(--radius); background:white; }
.finder-panel h2 { margin:0 0 20px; font-size:24px; }
.finder-panel h3 { margin:24px 0 12px; font-size:16px; }
.field { display:grid; gap:8px; max-width:480px; margin:14px 0; font-size:13px; font-weight:600; }
.field input[type=range] { width:100%; accent-color:var(--color-accent); }
.field input[type=number] { max-width:160px; }
.form-help,.notice,.error-message,.sample-note { color:var(--color-secondary); font-size:12px; }
.notice { padding:10px 12px; border:1px solid var(--color-border); background:var(--color-surface); }
.error-message { color:#a32626; }
.choice-list { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:18px; }
.choice-list button { min-height:42px; padding:8px 14px; border:1px solid var(--color-border); border-radius:8px; background:white; color:var(--color-text); }
.choice-list button[aria-pressed=true] { border-color:var(--color-accent); background:#fff6f5; color:var(--color-accent-hover); }
.choice-list button:disabled { opacity:.45; }
.results-heading { display:flex; justify-content:space-between; align-items:start; gap:16px; }
.results-heading h2 { margin-bottom:6px; }
.results-heading p { margin:0; color:var(--color-secondary); font-size:13px; }
.text-button,.back-button { display:inline-flex; align-items:center; gap:6px; min-height:40px; padding:6px 10px; border:1px solid var(--color-border); border-radius:6px; background:white; color:var(--color-text); }
.recommendation-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; margin-top:18px; }
.no-results { margin-top:20px; padding:18px; background:var(--color-surface); }
.step-actions { display:flex; justify-content:space-between; margin-top:18px; }
.step-actions button:disabled { opacity:.45; }
.sample-note { margin-top:14px; }
.finder-feedback { position:fixed; z-index:15; bottom:16px; left:50%; transform:translateX(-50%); padding:12px 18px; background:#222; color:#fff; border-radius:8px; font-size:13px; }
@media(max-width:900px){.recommendation-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.finder-page{padding-top:18px}.step-list{grid-template-columns:repeat(2,1fr);row-gap:14px}.finder-panel{padding:16px}.results-heading{flex-direction:column}.recommendation-grid{grid-template-columns:1fr}}
</style>
