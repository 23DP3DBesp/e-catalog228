import { apiRequest, isDemoMode } from './api.js'

export async function getCatalogProducts() {
  if (!isDemoMode) {
    const result = await apiRequest('/api/products')
    if (!Array.isArray(result.products)) throw new Error('Serveris atgrieza nepareizu riepu sarakstu.')
    return result.products
  }
  const { products } = await import('../data/products.js')
  return products
}
