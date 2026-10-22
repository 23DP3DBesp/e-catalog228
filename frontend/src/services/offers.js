import { apiRequest, isDemoMode } from './api.js'
import { getDemoOffers } from '../data/offers.js'

export async function getProductOffers(product) {
  if (!isDemoMode) {
    const result = await apiRequest(`/api/products/${encodeURIComponent(product.id)}/offers`)
    if (!Array.isArray(result.offers)) throw new Error('Serveris atgrieza nepareizus piedāvājumus.')
    return result.offers
  }
  return getDemoOffers(product)
}
