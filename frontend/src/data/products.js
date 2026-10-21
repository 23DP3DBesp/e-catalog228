// Demonstration products and prices, not live merchant offers.
// Keep IDs stable: existing local carts reference these products.
const baseProducts = [
    { id: 1, brand: 'Michelin', model: 'Primacy 4+', size: '205/55 R16', loadIndex: '91', speedIndex: 'V', season: 'summer', seasonLabel: 'Vasaras riepas', price: 112 },
    { id: 2, brand: 'Continental', model: 'WinterContact TS 870', size: '225/45 R17', loadIndex: '94', speedIndex: 'V', season: 'winter', seasonLabel: 'Ziemas riepas', price: 138 },
    { id: 3, brand: 'Goodyear', model: 'Vector 4Seasons Gen-3', size: '195/65 R15', loadIndex: '91', speedIndex: 'H', season: 'all-season', seasonLabel: 'Vissezonas riepas', price: 96 },
    { id: 4, brand: 'Bridgestone', model: 'Turanza 6', size: '215/60 R16', loadIndex: '95', speedIndex: 'V', season: 'summer', seasonLabel: 'Vasaras riepas', price: 124 },
    { id: 5, brand: 'Pirelli', model: 'Cinturato Winter 2', size: '205/60 R16', loadIndex: '92', speedIndex: 'H', season: 'winter', seasonLabel: 'Ziemas riepas', price: 129 },
    { id: 6, brand: 'Hankook', model: 'Kinergy 4S2', size: '225/50 R17', loadIndex: '98', speedIndex: 'W', season: 'all-season', seasonLabel: 'Vissezonas riepas', price: 104 },
    { id: 7, brand: 'Nokian Tyres', model: 'Snowproof 2', size: '225/45 R17', loadIndex: '94', speedIndex: 'H', season: 'winter', seasonLabel: 'Ziemas riepas', price: 119 },
    { id: 8, brand: 'Michelin', model: 'CrossClimate 2', size: '225/50 R17', loadIndex: '98', speedIndex: 'V', season: 'all-season', seasonLabel: 'Vissezonas riepas', price: 149 },
    { id: 9, brand: 'Continental', model: 'PremiumContact 7', size: '225/45 R17', loadIndex: '94', speedIndex: 'W', season: 'summer', seasonLabel: 'Vasaras riepas', price: 129.99 },
    { id: 10, brand: 'Goodyear', model: 'EfficientGrip Performance 2', size: '195/65 R15', loadIndex: '91', speedIndex: 'H', season: 'summer', seasonLabel: 'Vasaras riepas', price: 89 },
    { id: 11, brand: 'Hankook', model: 'Winter i*cept RS3', size: '215/60 R16', loadIndex: '99', speedIndex: 'H', season: 'winter', seasonLabel: 'Ziemas riepas', price: 109 },
    { id: 12, brand: 'Bridgestone', model: 'Blizzak LM005', size: '225/45 R17', loadIndex: '94', speedIndex: 'V', season: 'winter', seasonLabel: 'Ziemas riepas', price: 135 },
    { id: 13, brand: 'Pirelli', model: 'Cinturato All Season SF3', size: '225/50 R17', loadIndex: '98', speedIndex: 'W', season: 'all-season', seasonLabel: 'Vissezonas riepas', price: 142 },
    { id: 14, brand: 'Nokian Tyres', model: 'Hakkapeliitta 10', size: '215/60 R16', loadIndex: '99', speedIndex: 'T', season: 'winter', seasonLabel: 'Ziemas riepas', price: 165 },
]

// Explicit synthetic label values and rankings for UI demos, NOT verified model specifications.
// null means unavailable; do not infer missing label values.
const demoSpecs = [
  ['B', 'A', 69, true, 90], ['C', 'B', 71, true, 86], ['C', 'B', 70, true, 80],
  ['B', 'A', 70, false, 72], ['C', 'B', 72, true, 65], ['C', 'B', 72, true, 78],
  ['C', 'B', 70, true, 83], ['B', 'B', 71, true, 92], ['B', 'A', 71, true, 88],
  ['B', 'A', 68, true, 81], ['D', 'C', 72, false, 70], ['C', 'A', 71, true, 85],
  ['B', 'B', 70, false, 76], [null, null, null, true, 68],
]
export const products = baseProducts.map((product, index) => {
  const [fuel, wet, noise, available, popularity] = demoSpecs[index]
  return {
    ...product, fuel, wet, noise, available, popularity,
    studded: product.id === 14,
    markings: product.season === 'summer' ? [] : ['3PMSF', 'M+S'],
    image: 'images/tire-studio.jpg',
    demo: true,
  }
})

