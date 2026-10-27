import { getProductOffers } from './offers.js'
import { addToCart, getCart, replaceCart } from '../stores/cart.js'
import {
  applyOfferToItem,
  cartItemFromOffer,
  hasValidOffer,
  mergeByCartKey,
  pickBestOffer,
} from '../utils/cartOffers.js'

// "Add to cart" from a product card: the order needs a real offer, so pick the cheapest
// orderable one (shipping included) instead of adding a bare product.
// Result: { ok: true, offer } or { ok: false, reason: 'no-offer' | 'not-signed-in' }
export async function addProductWithBestOffer(product, quantity = 1) {
  const offers = await getProductOffers(product)
  const offer = pickBestOffer(offers, quantity)
  if (!offer) return { ok: false, reason: 'no-offer' }
  const cart = addToCart(cartItemFromOffer(product, offer, quantity))
  return cart ? { ok: true, offer } : { ok: false, reason: 'not-signed-in' }
}

// Fixes cart rows that have no valid offer (added before this fix, or from an old cart):
// gives them the cheapest orderable offer, or removes them if the product has none.
export async function repairCart() {
  const cart = getCart()
  if (cart.every(hasValidOffer)) return { cart, repaired: 0, removed: 0, failed: 0 }

  const rows = []
  let repaired = 0
  let removed = 0
  let failed = 0
  for (const item of cart) {
    if (hasValidOffer(item)) { rows.push(item); continue }
    try {
      const offer = pickBestOffer(await getProductOffers(item), item.quantity)
      if (offer) { rows.push(applyOfferToItem(item, offer)); repaired++ } else removed++
    } catch {
      rows.push(item) // server not reachable: keep the row, try again next time
      failed++
    }
  }

  const next = mergeByCartKey(rows)
  replaceCart(next)
  return { cart: next, repaired, removed, failed }
}