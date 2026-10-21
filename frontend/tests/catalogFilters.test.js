import test from 'node:test'
import assert from 'node:assert/strict'
import { products } from '../src/data/products.js'
import { readFilters, writeFilters, filterProducts, activeFilters, defaults } from '../src/utils/catalogFilters.js'
const search = patch => filterProducts(products, { ...defaults, ...patch })
test('multi-brand selection uses OR while season and budget use AND', () => {
  const result = search({ brands: ['Continental','Nokian Tyres'], season:'winter', maxPrice:140 })
  assert.deepEqual(result.map(p => p.id), [2,7])
})
test('combined EU label filters use explicit demo values', () => {
  assert.deepEqual(search({ fuel:'B', wet:'A', noise:'69', available:true }).map(p => p.id), [1,10])
})
test('unknown noise does not count as zero; non-studded excludes summer tires', () => {
  assert.ok(!search({ noise:'73' }).some(p => p.id === 14))
  assert.ok(search({ studs:'no' }).every(p => p.season === 'winter' && !p.studded))
  assert.deepEqual(search({ studs:'yes', marking:'3PMSF' }).map(p => p.id), [14])
})
test('sorting uses price and explicit demo popularity without mutating data', () => {
  const before = products.map(p => p.id)
  assert.equal(search({sort:'price-low'})[0].id,10)
  assert.equal(search({sort:'price-high'})[0].id,14)
  assert.equal(search({sort:'popular'})[0].id,8)
  assert.deepEqual(products.map(p => p.id),before)
})
test('all supported filters survive a query round trip', () => {
  const filters = {...defaults, brands:['Michelin','Continental'], width:'225', season:'winter', maxPrice:138, available:true, marking:'3PMSF', sort:'popular', view:'list'}
  assert.deepEqual(readFilters(writeFilters(filters,'demo')),filters)
  assert.equal(writeFilters(filters,'demo').vehicle,'demo')
})
test('malformed query parameters normalize safely and zero budget stays zero', () => {
  const result = readFilters({maxPrice:'NaN',available:'false',sort:'bad',brand:['Michelin',null,'Michelin'],noise:'0'})
  assert.equal(result.maxPrice,250)
  assert.equal(result.available,false)
  assert.equal(result.sort,'featured')
  assert.deepEqual(result.brands,['Michelin'])
  assert.equal(result.noise,'')
  assert.equal(search(readFilters({maxPrice:'0'})).length,0)
})
test('chips represent each active criterion separately', () => {
  const chips = activeFilters({...defaults,brands:['Michelin','Continental'],season:'winter',available:true,maxPrice:100})
  assert.equal(chips.length,5)
  assert.deepEqual(chips.filter(c => c.key === 'brands').map(c => c.value),['Michelin','Continental'])
})
