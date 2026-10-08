const priceFormatter = new Intl.NumberFormat('lv-LV', {
  style: 'currency',
  currency: 'EUR',
})

export function formatPrice(value) {
  return priceFormatter.format(value)
}
