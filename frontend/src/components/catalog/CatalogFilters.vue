<script setup>
import { computed, ref, useId } from 'vue'
import { seasons, parseSize } from '../../utils/catalogSearch'
import { MAX_PRICE } from '../../utils/catalogFilters'
import { formatPrice } from '../../utils/format'
const props = defineProps({ filters: { type: Object, required: true }, products: { type: Array, required: true } })
const emit = defineEmits(['change'])
const brandSearch = ref('')
const seasonGroup = useId()
const unique = values => [...new Set(values)].sort((a,b) => String(a).localeCompare(String(b), 'lv', { numeric: true }))
const brands = computed(() => unique([...props.products.map(p => p.brand), ...props.filters.brands]).filter(b => b.toLowerCase().includes(brandSearch.value.toLowerCase())))
const dimensions = computed(() => props.products.map(p => parseSize(p.size)))
const sizeFields = [{ key:'width',label:'Platums' }, { key:'profile',label:'Profils' }, { key:'diameter',label:'Diametrs' }]
const options = key => unique([...dimensions.value.map(s => s[key]), props.filters[key]].filter(Boolean))
const patch = (key, value) => emit('change', { [key]: value })
function toggleBrand(brand) {
  patch('brands', props.filters.brands.includes(brand) ? props.filters.brands.filter(b => b !== brand) : [...props.filters.brands, brand])
}
</script>
<template>
  <div class="filter-fields">
    <fieldset><legend>Riepu izmērs</legend><div class="dimension-fields"><label v-for="field in sizeFields" :key="field.key">{{ field.label }}<select :value="filters[field.key]" @change="patch(field.key, $event.target.value)"><option value="">Visi</option><option v-for="value in options(field.key)" :key="value" :value="value">{{ field.key === 'diameter' ? 'R' : '' }}{{ value }}</option></select></label></div></fieldset>
    <fieldset><legend>Sezona</legend><label class="check-row"><input type="radio" :name="seasonGroup" :checked="filters.season === 'all'" @change="patch('season','all')" />Visas sezonas</label><label v-for="season in seasons" :key="season.value" class="check-row"><input type="radio" :name="seasonGroup" :checked="filters.season === season.value" @change="patch('season',season.value)" />{{ season.label }}</label></fieldset>
    <fieldset><legend>Ražotājs</legend><label class="brand-search"><span class="visually-hidden">Meklēt ražotāju</span><input v-model="brandSearch" type="search" placeholder="Meklēt ražotāju" /></label><div class="brand-list"><label v-for="brand in brands" :key="brand" class="check-row"><input type="checkbox" :checked="filters.brands.includes(brand)" @change="toggleBrand(brand)" />{{ brand }}</label><p v-if="!brands.length" class="muted">Ražotājs nav atrasts.</p></div></fieldset>
    <fieldset><legend>Cena par riepu</legend><label class="price-caption">Līdz <output>{{ formatPrice(filters.maxPrice) }}</output><input type="range" min="0" :max="MAX_PRICE" step="1" :value="filters.maxPrice" aria-label="Maksimālā cena" @input="patch('maxPrice', Number($event.target.value))" /></label><div class="range-labels"><span>0 €</span><span>{{ MAX_PRICE }} €</span></div></fieldset>
    <fieldset><legend>Pieejamība</legend><label class="check-row"><input type="checkbox" :checked="filters.available" @change="patch('available', $event.target.checked)" />Tikai pieejamas (demo)</label></fieldset>
    <details open><summary>Papildu parametri <span>+</span></summary><div class="spec-fields">
      <label>Slodzes indekss<select :value="filters.load" @change="patch('load',$event.target.value)"><option value="">Visi</option><option v-for="value in unique([...products.map(p => p.loadIndex), filters.load].filter(Boolean))" :key="value">{{ value }}</option></select></label>
      <label>Ātruma indekss<select :value="filters.speed" @change="patch('speed',$event.target.value)"><option value="">Visi</option><option v-for="value in ['H','T','V','W','Y']" :key="value">{{ value }}</option></select></label>
      <label>Degvielas efektivitāte (demo)<select :value="filters.fuel" @change="patch('fuel',$event.target.value)"><option value="">Visas klases</option><option v-for="value in ['A','B','C','D','E']" :key="value">{{ value }}</option></select></label>
      <label>Saķere uz slapja ceļa (demo)<select :value="filters.wet" @change="patch('wet',$event.target.value)"><option value="">Visas klases</option><option v-for="value in ['A','B','C','D','E']" :key="value">{{ value }}</option></select></label>
      <label>Ārējais troksnis (demo)<select :value="filters.noise" @change="patch('noise',$event.target.value)"><option value="">Jebkurš</option><option v-for="value in [68,69,70,71,72,73]" :key="value" :value="String(value)">Līdz {{ value }} dB</option></select></label>
    </div></details>
    <details><summary>Ziemas aprīkojums <span>+</span></summary><div class="spec-fields"><label>Radzes (demo)<select :value="filters.studs" @change="patch('studs',$event.target.value)"><option value="">Jebkuras</option><option value="yes">Ar radzēm</option><option value="no">Bez radzēm</option></select></label><label>Marķējums (demo)<select :value="filters.marking" @change="patch('marking',$event.target.value)"><option value="">Jebkurš</option><option>3PMSF</option><option>M+S</option></select></label></div></details>
  </div>
</template>
<style scoped>
fieldset { border: 0; border-bottom: 1px solid var(--color-border); margin: 0 0 24px; padding: 0 0 24px; min-width: 0; }legend { font-size: 13px; font-weight: 600; margin-bottom: 16px; }label { display: grid; gap: 8px; font-size: 11px; color: #52525b; }select { min-height: 42px; padding: 8px; font-size: 12px; width: 100%; min-width: 0; border-radius: 8px; }.dimension-fields { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; }.check-row { display: flex; align-items: center; gap: 10px; font-size: 13px; min-height: 36px; cursor: pointer; }.check-row input { width: 16px; height: 16px; min-height: 0; margin: 0; accent-color: var(--color-accent-hover); flex-shrink: 0; }.brand-search input { width: 100%; min-width: 0; min-height: 40px; padding: 8px 12px; font-size: 12px; margin-bottom: 12px; }.brand-list { max-height: 220px; overflow-y: auto; padding: 4px; }.price-caption { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; font-size: 13px; }.price-caption output { color: var(--color-text); font-weight: 600; }.price-caption input { width: 100%; padding: 0; min-height: 36px; accent-color: var(--color-accent-hover); }.range-labels { display: flex; justify-content: space-between; color: var(--color-secondary); font-size: 11px; }details { border-bottom: 1px solid var(--color-border); margin-bottom: 20px; padding-bottom: 20px; }summary { display: flex; justify-content: space-between; list-style: none; cursor: pointer; font-size: 13px; font-weight: 600; min-height: 30px; }summary::-webkit-details-marker { display: none; }details[open] summary span { transform: rotate(45deg); }.spec-fields { display: grid; gap: 16px; margin-top: 16px; }.muted { color: var(--color-secondary); font-size: 12px; }
</style>
