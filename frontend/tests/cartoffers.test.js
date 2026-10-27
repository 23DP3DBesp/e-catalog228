import test from 'node:test'
import assert from 'node:assert/strict'
import { applyOfferToItem, cartItemFromOffer, hasValidOffer, isOrderable, mergeByCartKey, pickBestOffer } from '../src/utils/cartoffers.js'

const fixed = { id: 1, merchantId: 'a', merchant: 'A', price: 100, available: true, shipping: { type: 'fixed', amount: 5 } }
const freeFrom4 = { id: 2, merchantId: 'b', merchant: 'B', price: 100.5, available: true, shipping: { type: 'free-from-quantity', amount: 6, quantity: 4 } }
const unknown = { id: 3, merchantId: 'c', merchant: 'C', price: 50, available: true, shipping: { type: 'unknown', amount: null } }
const soldOut = { id: 4, merchantId: 'd', merchant: 'D', price: 40, available: false, shipping: { type: 'fixed', amount: 1 } }

test('only real, positive offer ids count', () => {
  for (const offerId of [1, '7']) assert.equal(hasValidOffer({ offerId }), true, String(offerId))
  for (const offerId of [undefined, null, '', 0, -1, 'offer-a', 'default', 1.5]) assert.equal(hasValidOffer({ offerId }), false, String(offerId))
})
test('unavailable offers and unknown shipping cannot be ordered', () => {
  assert.equal(isOrderable(fixed), true); assert.equal(isOrderable(unknown), false); assert.equal(isOrderable(soldOut), false)
})
test('best offer is the cheapest total including shipping, for that quantity', () => {
  assert.equal(pickBestOffer([fixed, freeFrom4, unknown, soldOut], 1).id, 1)   // 105 vs 106.5
  assert.equal(pickBestOffer([fixed, freeFrom4], 4).id, 2)                      // 405 vs 402 (free shipping from 4)
  assert.equal(pickBestOffer([unknown, soldOut], 1), null)
  assert.equal(pickBestOffer([], 1), null)
  assert.equal(pickBestOffer(undefined, 1), null)
})
test('a cart row built from an offer carries everything checkout needs', () => {
  const row = cartItemFromOffer({ id: 9, brand: 'X', price: 1 }, freeFrom4, 2)
  assert.deepEqual({ id: row.id, price: row.price, quantity: row.quantity, offerId: row.offerId, merchantId: row.merchantId, cartKey: row.cartKey, rule: row.shippingRule },
    { id: 9, price: 100.5, quantity: 2, offerId: 2, merchantId: 'b', cartKey: '9:2', rule: freeFrom4.shipping })
  assert.equal(hasValidOffer(row), true)
})
test('repairing a row replaces a stale cartKey', () => {
  const fixedRow = applyOfferToItem({ id: 3, quantity: 2, cartKey: '3:default', price: 1 }, fixed)
  assert.equal(fixedRow.cartKey, '3:1'); assert.equal(fixedRow.quantity, 2)
})
test('rows with the same cartKey are merged', () => {
  const merged = mergeByCartKey([{ id: 1, cartKey: '1:5', quantity: 2 }, { id: 2, cartKey: '2:5', quantity: 1 }, { id: 1, cartKey: '1:5', quantity: 3 }])
  assert.deepEqual(merged.map(i => [i.cartKey, i.quantity]), [['1:5', 5], ['2:5', 1]])
})