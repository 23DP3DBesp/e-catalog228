
import { apiRequest, isDemoMode } from './api.js'
import { getDemoOffers } from '../data/offers.js'

export async function getProductOffers(product) {
  if (!isDemoMode) {
    const result = await apiRequest(
      `/api/products/${encodeURIComponent(product.id)}/offers`
    )

    if (!Array.isArray(result)) {
      throw new Error('Server returned invalid offers.')
    }

    return result
  }

  return getDemoOffers(product)
}
