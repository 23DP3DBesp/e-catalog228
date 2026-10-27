import { calculateOfferTotal } from './orderTotals.js'

// A cart row can be ordered only if it points at a real offer from the server
export function hasValidOffer(item) {
  const offerId = Number(item?.offerId)
  return Number.isInteger(offerId) && offerId > 0
}

// The server refuses unavailable offers and offers whose shipping cost is unknown
export function isOrderable(offer) {
  return Boolean(offer?.available)
    && offer.shipping?.type !== 'unknown'
    && Number.isFinite(offer.shipping?.amount)
}

// Cheapest orderable offer for this quantity, shipping included. null if there is none.
export function pickBestOffer(offers, quantity = 1) {
  let best = null
  let bestTotal = Infinity
  for (const offer of offers || []) {
    if (!isOrderable(offer)) continue
    const { total } = calculateOfferTotal(offer, quantity)
    if (total !== null && total < bestTotal) { best = offer; bestTotal = total }
  }
  return best
}

export function applyOfferToItem(item, offer) {
  return {
    ...item,
    price: offer.price,
    offerId: offer.id,
    merchantId: offer.merchantId,
    merchant: offer.merchant,
    shippingRule: offer.shipping,
    cartKey: `${item.id}:${offer.id}`,
  }
}

export function cartItemFromOffer(product, offer, quantity = 1) {
  return applyOfferToItem({ ...product, quantity }, offer)
}

// Rows with the same cartKey become one row with the quantities added up
export function mergeByCartKey(items) {
  const merged = new Map()
  for (const item of items) {
    const key = item.cartKey || `${item.id}:${item.offerId || 'default'}`
    const existing = merged.get(key)
    if (existing) existing.quantity += Number(item.quantity)
    else merged.set(key, { ...item })
  }
  return [...merged.values()]
}