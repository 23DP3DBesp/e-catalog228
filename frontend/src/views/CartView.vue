<template>
    <main class="cart-shell">
        <section class="cart-card" aria-labelledby="cart-title">

            <div class="cart-content">
                <div class="cart-heading">
                    <p class="cart-eyebrow">Tava izvēle</p>
                    <h1 id="cart-title">Grozs</h1>
                    <p class="cart-description">Pārskati izvēlētās riepas un norādi nepieciešamo daudzumu.</p>
                </div>

                <div class="cart-layout">
                    <section v-if="cartItems.length" class="cart-items" aria-label="Groza preces">
                        <article v-for="item in cartItems" :key="item.id" class="cart-item">
                            <div class="cart-item-visual" :class="`season-${item.season}`" aria-hidden="true">
                                <span class="cart-tire-shape"></span>
                            </div>
                            <div class="cart-item-details">
                                <p class="cart-item-brand">{{ item.brand }}</p>
                                <h2>{{ item.model }}</h2>
                                <p class="cart-item-spec">{{ item.size }} · {{ item.seasonLabel }}</p>
                                <div class="cart-item-controls">
                                    <div class="quantity-control" aria-label="Daudzums">
                                        <button type="button" aria-label="Samazināt daudzumu" @click="changeQuantity(item.id, item.quantity - 1)">−</button>
                                        <span>{{ item.quantity }}</span>
                                        <button type="button" aria-label="Palielināt daudzumu" @click="changeQuantity(item.id, item.quantity + 1)">+</button>
                                    </div>
                                    <button class="remove-item" type="button" @click="removeItem(item.id)">Noņemt</button>
                                </div>
                            </div>
                            <strong class="cart-item-price">{{ formatPrice(item.price * item.quantity) }}</strong>
                        </article>
                    </section>

                    <section v-else class="cart-empty" aria-label="Tukšs grozs">
                        <div class="empty-icon" aria-hidden="true">
                            <span class="empty-icon-handle"></span>
                            <span class="empty-icon-basket"></span>
                            <span class="empty-icon-wheel empty-icon-wheel-left"></span>
                            <span class="empty-icon-wheel empty-icon-wheel-right"></span>
                        </div>
                        <h2>Tavs grozs ir tukšs</h2>
                        <p>Apskati riepu katalogu un pievieno savai izvēlei piemērotas riepas.</p>
                        <RouterLink class="cart-button" to="/catalog">Atvērt katalogu <span aria-hidden="true">&#8594;</span></RouterLink>
                    </section>

                    <aside class="cart-summary" aria-label="Pasūtījuma kopsavilkums">
                        <div class="summary-topline">
                            <span>Pasūtījuma kopsavilkums</span>
                            <span class="summary-count">Daudzums: {{ cartCount }}</span>
                        </div>
                        <div class="summary-row">
                            <span>Preču summa</span>
                            <strong>{{ formatPrice(subtotal) }}</strong>
                        </div>
                        <div class="summary-row summary-muted">
                            <span>Piegāde</span>
                            <span>Izmaksas vēl nav zināmas</span>
                        </div>
                        <div class="summary-total">
                            <span>Bez piegādes</span>
                            <strong>{{ formatPrice(subtotal) }}</strong>
                        </div>
                        <button class="checkout-button" type="button" :disabled="!cartItems.length" @click="checkout">Noformēt pasūtījumu</button>
                    </aside>
                </div>
            </div>
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
    window.alert('Demonstrācijas režīms. Pasūtījuma noformēšana būs pieejama nākamajā izstrādes posmā; pasūtījums nav nosūtīts.')
}
</script>

<style scoped>
.cart-shell { display: flex; padding: 0; background: var(--color-bg); }
.cart-card { display: flex; width: 100%;  flex-direction: column;  background: #fff;  }
.cart-content { width: min(100% - 40px, 1060px); margin: auto; padding: 72px 0 90px; }
.cart-heading { max-width: 580px; }
.cart-eyebrow { margin: 0 0 17px; color: var(--color-accent-hover); font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
.cart-heading h1 { margin: 0; color: var(--color-text); font-size: clamp(46px, 6vw, 76px); font-weight: 400; letter-spacing: -3.5px; line-height: 0.98; }
.cart-description { margin: 24px 0 0; color: var(--color-secondary); font-size: 17px; line-height: 1.55; }
.cart-layout { display: grid; grid-template-columns: minmax(0, 1fr) 330px; gap: 28px; margin-top: 54px; }
.cart-items { display: grid; gap: 12px; }
.cart-item { display: grid; grid-template-columns: 108px minmax(0, 1fr) auto; align-items: center; gap: 20px; padding: 16px; border: 1px solid var(--color-border); border-radius: var(--radius); }
.cart-item-visual { display: grid; width: 108px; height: 108px; place-items: center; border-radius: 17px; background: #f2f1ef; }
.cart-item-visual.season-winter { background: #edf2f2; }
.cart-item-visual.season-all-season { background: #f3f0ea; }
.cart-tire-shape { width: 62px; height: 62px; border: 11px solid #25292b; border-radius: 50%; box-shadow: inset 0 0 0 5px #4d5355; }
.cart-tire-shape::after { display: block; width: 18px; height: 18px; margin: 11px auto; border: 4px solid #b7b6b0; border-radius: 50%; content: ''; }
.cart-item-brand { margin: 0 0 4px; color: var(--color-accent-hover); font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.cart-item h2 { margin: 0; color: var(--color-text); font-size: 18px; font-weight: 600; }
.cart-item-spec { margin: 8px 0 14px; color: var(--color-secondary); font-size: 13px; }
.cart-item-controls { display: flex; align-items: center; gap: 16px; }
.quantity-control { display: inline-flex; align-items: center; gap: 14px; padding: 4px 8px; border: 1px solid #dedede; border-radius: 18px; color: var(--color-text); font-size: 13px; }
.quantity-control button { width: 22px; height: 22px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--color-text); cursor: pointer; font-size: 18px; line-height: 1; }
.quantity-control button:hover { background: #f0eeeb; }
.remove-item { padding: 0; border: 0; background: transparent; color: #858585; cursor: pointer; font-size: 12px; }
.remove-item:hover { color: var(--color-accent-hover); }
.cart-item-price { align-self: start; color: var(--color-text); font-size: 18px; white-space: nowrap; }
.cart-empty { display: flex; min-height: 350px; flex-direction: column; align-items: center; justify-content: center; padding: 48px 32px; border: 1px solid var(--color-border); border-radius: 30px; text-align: center; }
.empty-icon { position: relative; width: 67px; height: 55px; margin-bottom: 27px; color: var(--color-accent-hover); }
.empty-icon-handle { position: absolute; top: 0; left: 8px; width: 20px; height: 17px; border: 3px solid currentColor; border-bottom: 0; border-radius: 7px 7px 0 0; transform: skewX(-12deg); }
.empty-icon-basket { position: absolute; top: 13px; left: 15px; width: 46px; height: 30px; border: 3px solid currentColor; border-top: 0; border-radius: 2px 2px 12px 12px; transform: skewX(-8deg); }
.empty-icon-wheel { position: absolute; bottom: 2px; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.empty-icon-wheel-left { left: 22px; }
.empty-icon-wheel-right { right: 7px; }
.cart-empty h2 { margin: 0; color: var(--color-text); font-size: 24px; font-weight: 600; letter-spacing: -0.7px; }
.cart-empty p { max-width: 330px; margin: 12px 0 25px; color: var(--color-secondary); font-size: 15px; line-height: 1.5; }
.cart-button, .checkout-button { border: 0; border-radius: var(--radius); font-size: 14px; font-weight: 600; }
.cart-button { padding: 15px 21px; background: var(--color-accent-hover); color: #fff; text-decoration: none; }
.cart-button span { margin-left: 8px; font-size: 17px; }
.cart-button:hover { filter: brightness(1.08); }
.cart-summary { align-self: start; padding: 28px; border-radius: var(--radius); background: #f7f6f4; }
.summary-topline, .summary-row, .summary-total { display: flex; align-items: center; justify-content: space-between; }
.summary-topline { padding-bottom: 22px; border-bottom: 1px solid #e4e2df; color: var(--color-text); font-size: 16px; font-weight: 600; }
.summary-count, .summary-muted { color: #858585; font-size: 12px; font-weight: 400; }
.summary-row { padding: 20px 0 0; color: #4e555a; font-size: 14px; }
.summary-row strong { color: var(--color-text); font-weight: 600; }
.summary-muted { align-items: flex-start; gap: 18px; line-height: 1.4; text-align: right; }
.summary-total { margin-top: 24px; padding-top: 20px; border-top: 1px solid #e4e2df; color: var(--color-text); font-size: 16px; font-weight: 600; }
.summary-total strong { font-size: 20px; }
.checkout-button { width: 100%; margin-top: 26px; padding: 16px; background: var(--color-accent-hover); color: #fff; cursor: pointer; }

@media (max-width: 760px) {
    .cart-shell { padding: 0; }
    .cart-card { border-radius: 0; }
    .cart-content { width: min(100% - 56px, 1060px); padding: 56px 0 70px; }
    .cart-layout { grid-template-columns: 1fr; margin-top: 40px; }
    .cart-item { grid-template-columns: 82px minmax(0, 1fr); gap: 14px; }
    .cart-item-visual { width: 82px; height: 82px; }
    .cart-tire-shape { width: 48px; height: 48px; border-width: 8px; }
    .cart-tire-shape::after { width: 14px; height: 14px; margin: 8px auto; border-width: 3px; }
    .cart-item-price { grid-column: 2; justify-self: start; font-size: 16px; }
    .cart-item-controls { gap: 10px; }
    .cart-empty { min-height: 300px; }
}

@media (max-width: 440px) {
    .cart-heading h1 { font-size: 46px; letter-spacing: -2.5px; }
    .cart-description { font-size: 15px; }
    .cart-empty { padding: 40px 22px; }
}
</style>