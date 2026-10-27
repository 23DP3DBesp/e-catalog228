import { apiRequest, isDemoMode } from './api.js'

const PAGE_SIZE = 50 // the largest page the API allows
const SEASON_LABELS = {
  summer: 'Vasaras riepas',
  winter: 'Ziemas riepas',
  'all-season': 'Vissezonas riepas',
}

export async function getCatalogProducts() {
  if (!isDemoMode) {
    const products = []
    let page = 1
    let totalPages = 1
    // The API answers in pages, so keep asking until every product has been loaded
    do {
      const result = await apiRequest(`/api/products?limit=${PAGE_SIZE}&page=${page}`)
      if (!Array.isArray(result.items)) {
        throw new Error('Server returned an invalid product list.')
      }
      products.push(...result.items)
      totalPages = Number(result.totalPages) || 1
      page += 1
    } while (page <= totalPages)

    // The API returns the season code only; the Latvian label is added here
    return products.map(product => ({ ...product, seasonLabel: SEASON_LABELS[product.season] || product.season }))
  }

  const { products } = await import('../data/products.js')
  return products
}