// Replace this boundary with the future API client; no backend contract changed.
export async function getCatalogProducts() {
  const { products } = await import('../../data/products.js')
  return products
}
