import { user } from '../services/auth.js'

const FAVORITES_KEY = 'ecatalog-favorites'
const COMPARE_KEY = 'ecatalog-compare'
const MAX_COMPARE_ITEMS = 4

function readIds(key) {
  try {
    const ids = JSON.parse(localStorage.getItem(`${key}:${user.value?.id || 'guest'}`) || '[]')
    return Array.isArray(ids) ? [...new Set(ids.map(Number).filter(Number.isFinite))] : []
  } catch {
    return []
  }
}

function saveIds(key, ids) {
  localStorage.setItem(`${key}:${user.value?.id || 'guest'}`, JSON.stringify(ids))
  window.dispatchEvent(new Event('ecatalog:selection-updated'))
}

export function getFavorites() { return readIds(FAVORITES_KEY) }
export function hasFavorite(id) { return getFavorites().includes(Number(id)) }

export function toggleFavorite(id) {
  const favorites = getFavorites()
  const productId = Number(id)
  const next = favorites.includes(productId)
    ? favorites.filter(item => item !== productId)
    : [...favorites, productId]
  saveIds(FAVORITES_KEY, next)
  return next.includes(productId)
}

export function getCompared() { return readIds(COMPARE_KEY) }
export function hasCompared(id) { return getCompared().includes(Number(id)) }

export function toggleCompared(id) {
  const compared = getCompared()
  const productId = Number(id)
  if (compared.includes(productId)) {
    saveIds(COMPARE_KEY, compared.filter(item => item !== productId))
    return { added: false, full: false }
  }
  if (compared.length >= MAX_COMPARE_ITEMS) return { added: false, full: true }
  saveIds(COMPARE_KEY, [...compared, productId])
  return { added: true, full: false }
}

export function clearCompared() { saveIds(COMPARE_KEY, []) }
