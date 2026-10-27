import test from 'node:test'
import assert from 'node:assert/strict'
const values = new Map()
globalThis.localStorage = {
  getItem(key) { return values.get(key) ?? null },
  setItem(key, value) { values.set(key, String(value)) },
  removeItem(key) { values.delete(key) },
}
globalThis.window = { dispatchEvent() {} }
const { setAuth, clearAuth } = await import('../src/services/auth.js')
const store = await import('../src/stores/cart.js')
const CART = 'ecatalog-cart:user-1' // the cart is stored per logged-in user
const signIn = () => setAuth({ user: { id: 'user-1' }, session: { accessToken: 'token', expiresAt: Math.floor(Date.now() / 1000) + 3600 } })

test('cart needs a logged-in user', () => {
  values.clear(); clearAuth()
  assert.equal(store.addToCart({ id: 1, price: 10, quantity: 1 }), null)
  assert.deepEqual(store.getCart(), [])
})
test('same offer merges; different merchant offers stay separate', () => {
  values.clear(); signIn()
  const product = {id:2,price:100,quantity:2,offerId:'a',merchantId:'a',merchant:'Demo A'}
  store.addToCart(product)
  store.addToCart(product)
  store.addToCart({...product,offerId:'b',merchantId:'b',merchant:'Demo B'})
  assert.deepEqual(store.getCart().map(i => [i.cartKey,i.quantity]),[['2:a',4],['2:b',2]])
  assert.equal(store.getCartCount(),6)
})
test('legacy cart rows without a merchant remain editable', () => {
  values.clear(); signIn()
  values.set(CART,JSON.stringify([{id:1,price:90,quantity:1,brand:'Michelin'}]))
  assert.equal(store.updateCartQuantity(1,3)[0].quantity,3)
  assert.equal(store.removeFromCart(1).length,0)
})
test('corrupted and invalid cart rows are ignored safely', () => {
  values.clear(); signIn()
  values.set(CART,'not-json')
  assert.deepEqual(store.getCart(),[])
  values.set(CART,JSON.stringify([{id:1,price:50,quantity:-1},{id:2,price:30,quantity:2}]))
  assert.deepEqual(store.getCart().map(i=>i.id),[2])
})
test('replaceCart overwrites the stored cart', () => {
  values.clear(); signIn()
  store.addToCart({ id: 1, price: 10, quantity: 1 })
  store.replaceCart([{ id: 5, price: 20, quantity: 2, cartKey: '5:9', offerId: 9 }])
  assert.deepEqual(store.getCart().map(i => i.cartKey), ['5:9'])
})