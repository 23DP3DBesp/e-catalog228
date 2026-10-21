import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateOfferTotal, calculateShipping, calculateCartTotals } from '../src/utils/orderTotals.js'
import { getDemoOffers } from '../src/data/offers.js'
import { products } from '../src/data/products.js'
const [fixed, freeDelivery, unknown] = getDemoOffers(products[0])
test('fixed delivery is charged once per offer order', () => {
  assert.deepEqual(calculateOfferTotal(fixed,4), {products:448,shipping:4.99,total:452.99})
})
test('quantity threshold makes demo shipping free at four tires', () => {
  assert.equal(calculateShipping(freeDelivery.shipping,2),5.9)
  assert.deepEqual(calculateOfferTotal(freeDelivery,4), {products:473.36,shipping:0,total:473.36})
})
test('unknown delivery stays unknown rather than zero', () => {
  assert.deepEqual(calculateOfferTotal(unknown,2), {products:246.32,shipping:null,total:null})
})
test('cart groups delivery by merchant and recognizes the legacy demo cart', () => {
  assert.deepEqual(calculateCartTotals([
    {id:1,price:100,quantity:2,merchantId:'demo-a',shippingRule:{type:'fixed',amount:4.99}},
    {id:2,price:50,quantity:2,merchantId:'demo-a',shippingRule:{type:'fixed',amount:4.99}},
  ]), {productSubtotal:300,shipping:4.99,total:304.99})
  assert.deepEqual(calculateCartTotals([{id:1,price:100,quantity:1}]),{productSubtotal:100,shipping:null,total:null})
})
test('one unknown merchant makes the cart total unknown', () => {
  assert.equal(calculateCartTotals([
    {id:1,price:100,quantity:1,merchantId:'demo-a',shippingRule:{type:'fixed',amount:4.99}},
    {id:2,price:50,quantity:1,merchantId:'demo-c',shippingRule:{type:'unknown'}},
  ]).total,null)
})
