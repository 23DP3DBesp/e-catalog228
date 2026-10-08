export const seasons = [
  { value: 'summer', label: 'Vasaras riepas' },
  { value: 'winter', label: 'Ziemas riepas' },
  { value: 'all-season', label: 'Vissezonas riepas' },
]
export function parseSize(size) {
  const match = /^(\d{3})\/(\d{2}) R(\d{2})$/.exec(size)
  return match ? { width: match[1], profile: match[2], diameter: match[3] } : {}
}
export function readCatalogQuery(query) {
  const text = (key) => typeof query[key] === 'string' ? query[key] : ''
  return {
    q: text('q'),
    season: seasons.some(s => s.value === text('season')) ? text('season') : 'all',
    width: /^\d{3}$/.test(text('width')) ? text('width') : '',
    profile: /^\d{2}$/.test(text('profile')) ? text('profile') : '',
    diameter: /^\d{2}$/.test(text('diameter')) ? text('diameter') : '',
  }
}
export function matchesDimensions(product, filters) {
  const size = parseSize(product.size)
  return ['width', 'profile', 'diameter'].every(key => !filters[key] || filters[key] === size[key])
}
