import { isAuthenticated, user } from '../services/auth.js'

const CART_STORAGE_KEY = 'ecatalog-cart'
function storageKey() { return `${CART_STORAGE_KEY}:${user.value?.id || 'guest'}` }

function readStoredCart() {
  try {
    const storedCart = JSON.parse(localStorage.getItem(storageKey()) || '[]')
    return Array.isArray(storedCart) ? storedCart.filter(item => item && Number.isFinite(Number(item.id)) && Number.isFinite(Number(item.price)) && Number(item.quantity) > 0).map(item => ({ ...item, quantity: Number(item.quantity), price: Number(item.price) })) : []
  } catch {
    return []
  }
}
function productKey(item) { return item.cartKey || `${item.id}:${item.offerId || 'default'}` }
function saveCart(cart) {
  localStorage.setItem(storageKey(), JSON.stringify(cart))
  localStorage.setItem('cartCount', String(cart.reduce((total, item) => total + item.quantity, 0)))
  window.dispatchEvent(new Event('ecatalog:cart-updated'))
}
export function getCart() { return readStoredCart() }
export function clearCart() { saveCart([]); return [] }
export function replaceCart(cart) { saveCart(cart); return cart }
export function addToCart(product) {
  if (!isAuthenticated.value) return null
  const cart = readStoredCart()
  const incoming = { ...product, cartKey: product.cartKey || `${product.id}:${product.offerId || 'default'}` }
  const existingItem = cart.find(item => productKey(item) === incoming.cartKey)
  if (existingItem) existingItem.quantity += Number(product.quantity || 1)
  else cart.push({ ...incoming, quantity: Number(product.quantity || 1) })
  saveCart(cart)
  return cart
}
function matchesId(item, id) { return productKey(item) === String(id) || (typeof id === 'number' && item.id === id) }
export function updateCartQuantity(productId, quantity) {
  const cart = readStoredCart()
  const item = cart.find(cartItem => matchesId(cartItem, productId))
  if (!item) return cart
  if (quantity <= 0) return removeFromCart(productId)
  item.quantity = Number(quantity)
  saveCart(cart)
  return cart
}
export function removeFromCart(productId) {
  const cart = readStoredCart().filter(item => !matchesId(item, productId))
  saveCart(cart)
  return cart
}
export function getCartCount(cart = readStoredCart()) {
  return cart.reduce((total, item) => total + Number(item.quantity || 0), 0)
}