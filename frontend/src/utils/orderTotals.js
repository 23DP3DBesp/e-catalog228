export function calculateShipping(shipping, quantity) {
  if (!shipping || shipping.type === 'unknown' || !Number.isFinite(shipping.amount)) return null
  if (shipping.type === 'free-from-quantity' && quantity >= shipping.quantity) return 0
  return shipping.amount
}
export function calculateOfferTotal(offer, quantity) {
  const products = Math.round(offer.price * quantity * 100) / 100
  const shipping = calculateShipping(offer.shipping, quantity)
  return { products, shipping, total: shipping === null ? null : Math.round((products + shipping) * 100) / 100 }
}
export function calculateCartTotals(items) {
  const productSubtotal = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100
  const byMerchant = new Map()
  for (const item of items) {
    const key = item.merchantId || 'legacy-demo'
    const existing = byMerchant.get(key)
    if (!existing) byMerchant.set(key, { quantity: item.quantity, shipping: item.shippingRule || null })
    else existing.quantity += item.quantity
  }
  let shipping = 0
  for (const group of byMerchant.values()) {
    const fee = calculateShipping(group.shipping, group.quantity)
    if (fee === null) return { productSubtotal, shipping: null, total: null }
    shipping += fee
  }
  shipping = Math.round(shipping * 100) / 100
  return { productSubtotal, shipping, total: Math.round((productSubtotal + shipping) * 100) / 100 }
}
