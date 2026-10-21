// Fictional merchant and shipping examples for frontend demonstration only.
// These are not real merchants, stock claims, or current market prices.
const merchantNames = ['Demo tirgotava A', 'Demo tirgotava B', 'Demo tirgotava C']
const shippingRules = [
  { type: 'fixed', amount: 4.99 },
  { type: 'free-from-quantity', amount: 5.9, quantity: 4 },
  { type: 'unknown', amount: null },
]
export function getDemoOffers(product) {
  return [
    { id: 'offer-a', merchantId: 'demo-a', merchant: merchantNames[0], price: product.price, shipping: shippingRules[0], availability: 'Demo piemērs: pieejama', available: product.available },
    { id: 'offer-b', merchantId: 'demo-b', merchant: merchantNames[1], price: Math.round((product.price * 1.045 + 1.3) * 100) / 100, shipping: shippingRules[1], availability: 'Demo piemērs: pieejamība nav apstiprināta', available: true },
    { id: 'offer-c', merchantId: 'demo-c', merchant: merchantNames[2], price: Math.round((product.price * 1.08 + 2.2) * 100) / 100, shipping: shippingRules[2], availability: 'Demo piemērs: nav apstiprināta', available: false },
  ]
}
