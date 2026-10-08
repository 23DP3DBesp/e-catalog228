const CART_STORAGE_KEY = 'ecatalog-cart'

function readStoredCart() {
    try {
        const storedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]')
        return Array.isArray(storedCart) ? storedCart : []
    } catch {
        return []
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    localStorage.setItem('cartCount', String(cart.reduce((total, item) => total + item.quantity, 0)))
    window.dispatchEvent(new Event('ecatalog:cart-updated'))
}

export function getCart() {
    return readStoredCart()
}

export function addToCart(product) {
    const cart = readStoredCart()
    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
        existingItem.quantity += 1
    } else {
        cart.push({ ...product, quantity: 1 })
    }

    saveCart(cart)
    return cart
}

export function updateCartQuantity(productId, quantity) {
    const cart = readStoredCart()
    const item = cart.find((cartItem) => cartItem.id === productId)

    if (!item) return cart
    if (quantity <= 0) return removeFromCart(productId)

    item.quantity = quantity
    saveCart(cart)
    return cart
}

export function removeFromCart(productId) {
    const cart = readStoredCart().filter((item) => item.id !== productId)
    saveCart(cart)
    return cart
}

export function getCartCount(cart = readStoredCart()) {
    return cart.reduce((total, item) => total + item.quantity, 0)
}
