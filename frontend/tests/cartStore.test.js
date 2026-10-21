import test from 'node:test'
import assert from 'node:assert/strict'
const values = new Map()
globalThis.localStorage = {
  getItem(key) { return values.get(key) ?? null },
  setItem(key, value) { values.set(key, String(value)) },
}
globalThis.window = { dispatchEvent() {} }
const store = await import('../src/stores/cart.js')
test('same offer merges; different merchant offers stay separate', () => {
  values.clear()
  const product = {id:2,price:100,quantity:2,offerId:'a',merchantId:'a',merchant:'Demo A'}
  store.addToCart(product)
  store.addToCart(product)
  store.addToCart({...product,offerId:'b',merchantId:'b',merchant:'Demo B'})
  assert.deepEqual(store.getCart().map(i => [i.cartKey,i.quantity]),[['2:a',4],['2:b',2]])
  assert.equal(store.getCartCount(),6)
})
test('legacy cart rows without a merchant remain editable', () => {
  values.clear()
  values.set('ecatalog-cart',JSON.stringify([{id:1,price:90,quantity:1,brand:'Michelin'}]))
  assert.equal(store.updateCartQuantity(1,3)[0].quantity,3)
  assert.equal(store.removeFromCart(1).length,0)
})
test('corrupted and invalid cart rows are ignored safely', () => {
  values.clear()
  values.set('ecatalog-cart','not-json')
  assert.deepEqual(store.getCart(),[])
  values.set('ecatalog-cart',JSON.stringify([{id:1,price:50,quantity:-1},{id:2,price:30,quantity:2}]))
  assert.deepEqual(store.getCart().map(i=>i.id),[2])
})
