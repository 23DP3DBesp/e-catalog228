<template>
    <main class="cart-shell">
        <section class="cart-card" aria-labelledby="cart-title">
            <header class="cart-header">
                <RouterLink class="brand" to="/" aria-label="E-Catalog home">
                    <span class="brand-mark" aria-hidden="true"></span>
                    <span>E-Catalog</span>
                </RouterLink>

                <nav class="cart-nav" aria-label="Cart navigation">
                    <RouterLink to="/catalog">Catalog</RouterLink>
                    <RouterLink class="cart-sign-in" to="/login">Sign In</RouterLink>
                </nav>
            </header>

            <div class="cart-content">
                <div class="cart-heading">
                    <p class="cart-eyebrow">Your selection</p>
                    <h1 id="cart-title">Shopping cart</h1>
                    <p class="cart-description">Review your choices before you make them yours.</p>
                </div>

                <div class="cart-layout">
                    <section v-if="cartItems.length" class="cart-items" aria-label="Shopping cart items">
                        <article v-for="item in cartItems" :key="item.id" class="cart-item">
                            <div class="cart-item-visual" :class="`season-${item.season}`" aria-hidden="true">
                                <span class="cart-tire-shape"></span>
                            </div>
                            <div class="cart-item-details">
                                <p class="cart-item-brand">{{ item.brand }}</p>
                                <h2>{{ item.model }}</h2>
                                <p class="cart-item-spec">{{ item.size }} · {{ item.seasonLabel }}</p>
                                <div class="cart-item-controls">
                                    <div class="quantity-control" aria-label="Quantity">
                                        <button type="button" aria-label="Decrease quantity" @click="changeQuantity(item.id, item.quantity - 1)">−</button>
                                        <span>{{ item.quantity }}</span>
                                        <button type="button" aria-label="Increase quantity" @click="changeQuantity(item.id, item.quantity + 1)">+</button>
                                    </div>
                                    <button class="remove-item" type="button" @click="removeItem(item.id)">Remove</button>
                                </div>
                            </div>
                            <strong class="cart-item-price">{{ formatPrice(item.price * item.quantity) }}</strong>
                        </article>
                    </section>

                    <section v-else class="cart-empty" aria-label="Empty shopping cart">
                        <div class="empty-icon" aria-hidden="true">
                            <span class="empty-icon-handle"></span>
                            <span class="empty-icon-basket"></span>
                            <span class="empty-icon-wheel empty-icon-wheel-left"></span>
                            <span class="empty-icon-wheel empty-icon-wheel-right"></span>
                        </div>
                        <h2>Your cart is empty</h2>
                        <p>Start exploring the catalog and save the pieces that feel right.</p>
                        <RouterLink class="cart-button" to="/catalog">Browse catalog <span aria-hidden="true">&#8594;</span></RouterLink>
                    </section>

                    <aside class="cart-summary" aria-label="Order summary">
                        <div class="summary-topline">
                            <span>Order summary</span>
                            <span class="summary-count">{{ cartCount }} {{ cartCount === 1 ? 'item' : 'items' }}</span>
                        </div>
                        <div class="summary-row">
                            <span>Subtotal</span>
                            <strong>{{ formatPrice(subtotal) }}</strong>
                        </div>
                        <div class="summary-row summary-muted">
                            <span>Shipping</span>
                            <span>Calculated at checkout</span>
                        </div>
                        <div class="summary-total">
                            <span>Total</span>
                            <strong>{{ formatPrice(subtotal) }}</strong>
                        </div>
                        <button class="checkout-button" type="button" :disabled="!cartItems.length" @click="checkout">{{ cartItems.length ? 'Checkout' : 'Checkout' }}</button>
                    </aside>
                </div>
            </div>

            <footer class="cart-footer">
                <span>&copy; 2026 E-Catalog</span>
                <nav aria-label="Footer navigation">
                    <a href="mailto:support@ecatalog.com">Contact Us</a>
                    <span class="footer-language">English <span aria-hidden="true">&#8964;</span></span>
                </nav>
            </footer>
        </section>
    </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { formatPrice } from '../utils/format'
import { getCart, getCartCount, removeFromCart, updateCartQuantity } from '../stores/cart'

const cartItems = ref(getCart())

const cartCount = computed(() => getCartCount(cartItems.value))
const subtotal = computed(() => cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0))

function changeQuantity(productId, quantity) {
    cartItems.value = updateCartQuantity(productId, quantity)
}

function removeItem(productId) {
    cartItems.value = removeFromCart(productId)
}

function checkout() {
    window.alert('Checkout will be connected to the payment flow next.')
}
</script>

<style scoped>
.cart-shell { display: flex; min-height: 100vh; padding: 20px; background: #24211f; }
.cart-card { display: flex; width: 100%; min-height: calc(100vh - 40px); flex-direction: column; border-radius: 64px; background: #fff; box-shadow: 0 18px 55px rgb(0 0 0 / 18%); }
.cart-header, .cart-footer { display: flex; align-items: center; justify-content: space-between; }
.cart-header { padding: 34px 5% 28px; border-bottom: 1px solid #ededed; }
.brand, .cart-nav a, .cart-footer a { color: inherit; text-decoration: none; }
.brand { display: inline-flex; align-items: center; gap: 9px; font-size: 22px; font-weight: 700; letter-spacing: -1.1px; }
.brand-mark { display: inline-block; width: 24px; height: 24px; border: 3px solid transparent; border-radius: 50%; background: linear-gradient(#fff, #fff) padding-box, conic-gradient(#ff4b13, #ffd400, #00a9e8, #a13bdb, #ff4b13) border-box; }
.cart-nav { display: flex; align-items: center; gap: 28px; color: #4e555a; font-size: 14px; }
.cart-nav a:hover, .cart-footer a:hover { color: #ef552c; }
.cart-sign-in { padding: 10px 17px; border-radius: 22px; background: #161b20; color: #fff !important; }
.cart-content { width: min(100% - 40px, 1060px); margin: auto; padding: 72px 0 90px; }
.cart-heading { max-width: 580px; }
.cart-eyebrow { margin: 0 0 17px; color: #ef552c; font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
.cart-heading h1 { margin: 0; color: #19232b; font-size: clamp(46px, 6vw, 76px); font-weight: 400; letter-spacing: -3.5px; line-height: 0.98; }
.cart-description { margin: 24px 0 0; color: #697177; font-size: 17px; line-height: 1.55; }
.cart-layout { display: grid; grid-template-columns: minmax(0, 1fr) 330px; gap: 28px; margin-top: 54px; }
.cart-items { display: grid; gap: 12px; }
.cart-item { display: grid; grid-template-columns: 108px minmax(0, 1fr) auto; align-items: center; gap: 20px; padding: 16px; border: 1px solid #ededed; border-radius: 24px; }
.cart-item-visual { display: grid; width: 108px; height: 108px; place-items: center; border-radius: 17px; background: #f2f1ef; }
.cart-item-visual.season-winter { background: #edf2f2; }
.cart-item-visual.season-all-season { background: #f3f0ea; }
.cart-tire-shape { width: 62px; height: 62px; border: 11px solid #25292b; border-radius: 50%; box-shadow: inset 0 0 0 5px #4d5355; }
.cart-tire-shape::after { display: block; width: 18px; height: 18px; margin: 11px auto; border: 4px solid #b7b6b0; border-radius: 50%; content: ''; }
.cart-item-brand { margin: 0 0 4px; color: #ef552c; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.cart-item h2 { margin: 0; color: #19232b; font-size: 18px; font-weight: 600; }
.cart-item-spec { margin: 8px 0 14px; color: #697177; font-size: 13px; }
.cart-item-controls { display: flex; align-items: center; gap: 16px; }
.quantity-control { display: inline-flex; align-items: center; gap: 14px; padding: 4px 8px; border: 1px solid #dedede; border-radius: 18px; color: #19232b; font-size: 13px; }
.quantity-control button { width: 22px; height: 22px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: #19232b; cursor: pointer; font-size: 18px; line-height: 1; }
.quantity-control button:hover { background: #f0eeeb; }
.remove-item { padding: 0; border: 0; background: transparent; color: #858585; cursor: pointer; font-size: 12px; }
.remove-item:hover { color: #ef552c; }
.cart-item-price { align-self: start; color: #19232b; font-size: 18px; white-space: nowrap; }
.cart-empty { display: flex; min-height: 350px; flex-direction: column; align-items: center; justify-content: center; padding: 48px 32px; border: 1px solid #ededed; border-radius: 30px; text-align: center; }
.empty-icon { position: relative; width: 67px; height: 55px; margin-bottom: 27px; color: #ef552c; }
.empty-icon-handle { position: absolute; top: 0; left: 8px; width: 20px; height: 17px; border: 3px solid currentColor; border-bottom: 0; border-radius: 7px 7px 0 0; transform: skewX(-12deg); }
.empty-icon-basket { position: absolute; top: 13px; left: 15px; width: 46px; height: 30px; border: 3px solid currentColor; border-top: 0; border-radius: 2px 2px 12px 12px; transform: skewX(-8deg); }
.empty-icon-wheel { position: absolute; bottom: 2px; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.empty-icon-wheel-left { left: 22px; }
.empty-icon-wheel-right { right: 7px; }
.cart-empty h2 { margin: 0; color: #19232b; font-size: 24px; font-weight: 600; letter-spacing: -0.7px; }
.cart-empty p { max-width: 330px; margin: 12px 0 25px; color: #697177; font-size: 15px; line-height: 1.5; }
.cart-button, .checkout-button { border: 0; border-radius: 28px; font-size: 14px; font-weight: 600; }
.cart-button { padding: 15px 21px; background: linear-gradient(100deg, #a40505, #f63a3a 42%, #dd5e4b); color: #fff; text-decoration: none; }
.cart-button span { margin-left: 8px; font-size: 17px; }
.cart-button:hover { filter: brightness(1.08); }
.cart-summary { align-self: start; padding: 28px; border-radius: 28px; background: #f7f6f4; }
.summary-topline, .summary-row, .summary-total { display: flex; align-items: center; justify-content: space-between; }
.summary-topline { padding-bottom: 22px; border-bottom: 1px solid #e4e2df; color: #19232b; font-size: 16px; font-weight: 600; }
.summary-count, .summary-muted { color: #858585; font-size: 12px; font-weight: 400; }
.summary-row { padding: 20px 0 0; color: #4e555a; font-size: 14px; }
.summary-row strong { color: #19232b; font-weight: 600; }
.summary-muted { align-items: flex-start; gap: 18px; line-height: 1.4; text-align: right; }
.summary-total { margin-top: 24px; padding-top: 20px; border-top: 1px solid #e4e2df; color: #19232b; font-size: 16px; font-weight: 600; }
.summary-total strong { font-size: 20px; }
.checkout-button { width: 100%; margin-top: 26px; padding: 16px; background: #dedddb; color: #92908d; cursor: not-allowed; }
.cart-footer { padding: 0 5% 34px; color: #8a8a8a; font-size: 12px; }
.cart-footer nav { display: flex; align-items: center; gap: 28px; }
.cart-footer a, .footer-language { color: #262626; }

@media (max-width: 760px) {
    .cart-shell { padding: 0; }
    .cart-card { min-height: 100vh; border-radius: 0; }
    .cart-header { padding: 24px 28px 20px; }
    .cart-content { width: min(100% - 56px, 1060px); padding: 56px 0 70px; }
    .cart-layout { grid-template-columns: 1fr; margin-top: 40px; }
    .cart-item { grid-template-columns: 82px minmax(0, 1fr); gap: 14px; }
    .cart-item-visual { width: 82px; height: 82px; }
    .cart-tire-shape { width: 48px; height: 48px; border-width: 8px; }
    .cart-tire-shape::after { width: 14px; height: 14px; margin: 8px auto; border-width: 3px; }
    .cart-item-price { grid-column: 2; grid-row: 1; justify-self: end; font-size: 16px; }
    .cart-item-controls { gap: 10px; }
    .cart-empty { min-height: 300px; }
    .cart-footer { align-items: flex-end; padding: 0 28px 35px; }
    .cart-footer nav { align-items: flex-end; flex-direction: column; gap: 14px; }
}

@media (max-width: 440px) {
    .cart-nav { gap: 12px; }
    .cart-nav a:first-child { display: none; }
    .cart-heading h1 { font-size: 46px; letter-spacing: -2.5px; }
    .cart-description { font-size: 15px; }
    .cart-empty { padding: 40px 22px; }
}
</style>