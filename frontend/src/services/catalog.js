
import { apiRequest, isDemoMode } from './api.js'

export async function getCatalogProducts() {
  if (!isDemoMode) {
    const result = await apiRequest('/api/products')
    if (!Array.isArray(result.items)) {
      throw new Error('Server returned an invalid product list.')
    }
    return result.items
  }

  const { products } = await import('../data/products.js')
  return products
}
