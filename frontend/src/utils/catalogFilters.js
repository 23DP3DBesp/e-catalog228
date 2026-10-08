import { matchesDimensions, readCatalogQuery, seasons } from './catalogSearch.js'
export const MAX_PRICE = 250
export const defaults = { q: '', season: 'all', width: '', profile: '', diameter: '', brands: [], maxPrice: MAX_PRICE, load: '', speed: '', fuel: '', wet: '', noise: '', available: false, studs: '', marking: '', sort: 'featured', view: 'grid' }
const text = (query, key) => typeof query[key] === 'string' ? query[key] : ''
export function readFilters(query) {
  const price = text(query, 'maxPrice')
  const oneOf = (key, values, fallback = '') => values.includes(text(query, key)) ? text(query, key) : fallback
  const brands = Array.isArray(query.brand) ? query.brand : [query.brand]
  return {
    ...defaults, ...readCatalogQuery(query),
    brands: [...new Set(brands.filter(b => typeof b === 'string' && b.length > 0 && b.length < 80))],
    maxPrice: price && Number.isFinite(Number(price)) ? Math.min(MAX_PRICE, Math.max(0, Number(price))) : MAX_PRICE,
    load: /^\d{2,3}$/.test(text(query, 'load')) ? query.load : '',
    speed: oneOf('speed', ['H','T','V','W','Y']),
    fuel: oneOf('fuel', ['A','B','C','D','E']), wet: oneOf('wet', ['A','B','C','D','E']),
    noise: oneOf('noise', ['68','69','70','71','72','73']),
    available: query.available === '1', studs: oneOf('studs', ['yes','no']), marking: oneOf('marking', ['3PMSF','M+S']),
    sort: oneOf('sort', ['featured','price-low','price-high','brand','popular'], 'featured'),
    view: oneOf('view', ['grid','list'], 'grid'),
  }
}
export function writeFilters(filters, vehicle) {
  const query = {}
  for (const [key, value] of Object.entries(filters)) {
    if (key === 'brands') { if (value.length) query.brand = value; continue }
    if (value !== defaults[key] && value !== '') query[key] = value === true ? '1' : String(value)
  }
  if (vehicle === 'demo') query.vehicle = 'demo'
  return query
}
export function filterProducts(products, filters) {
  const query = filters.q.trim().toLocaleLowerCase('lv')
  return products.filter(p => {
    return (!query || `${p.brand} ${p.model} ${p.size}`.toLocaleLowerCase('lv').includes(query))
      && matchesDimensions(p, filters)
      && (filters.season === 'all' || p.season === filters.season)
      && (!filters.brands.length || filters.brands.includes(p.brand))
      && p.price <= filters.maxPrice
      && (!filters.load || p.loadIndex === filters.load)
      && (!filters.speed || p.speedIndex === filters.speed)
      && (!filters.fuel || p.fuel === filters.fuel)
      && (!filters.wet || p.wet === filters.wet)
      && (!filters.noise || (p.noise != null && p.noise <= Number(filters.noise)))
      && (!filters.available || p.available)
      && (!filters.studs || (p.season === 'winter' && p.studded === (filters.studs === 'yes')))
      && (!filters.marking || p.markings.includes(filters.marking))
  }).sort((a, b) => {
    if (filters.sort === 'price-low') return a.price - b.price || a.id - b.id
    if (filters.sort === 'price-high') return b.price - a.price || a.id - b.id
    if (filters.sort === 'brand') return a.brand.localeCompare(b.brand, 'lv') || a.id - b.id
    if (filters.sort === 'popular') return b.popularity - a.popularity || a.id - b.id
    return a.id - b.id
  })
}
export function activeFilters(filters) {
  const labels = { q: 'Meklēšana', width: 'Platums', profile: 'Profils', diameter: 'Diametrs', load: 'Slodzes indekss', speed: 'Ātruma indekss', fuel: 'Ekonomija', wet: 'Saķere', noise: 'Troksnis līdz', marking: 'Marķējums' }
  const chips = Object.entries(labels).filter(([key]) => filters[key]).map(([key, label]) => ({ key, label: `${label}: ${filters[key]}${key === 'noise' ? ' dB' : ''}` }))
  if (filters.season !== 'all') chips.push({ key: 'season', label: seasons.find(s => s.value === filters.season)?.label })
  for (const brand of filters.brands) chips.push({ key: 'brands', value: brand, label: brand })
  if (filters.maxPrice < MAX_PRICE) chips.push({ key: 'maxPrice', label: `Cena līdz ${filters.maxPrice} €` })
  if (filters.available) chips.push({ key: 'available', label: 'Pieejamas (demo)' })
  if (filters.studs) chips.push({ key: 'studs', label: filters.studs === 'yes' ? 'Ar radzēm' : 'Bez radzēm (ziemas)' })
  return chips
}
