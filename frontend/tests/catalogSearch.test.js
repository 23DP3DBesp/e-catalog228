import test from 'node:test'
import assert from 'node:assert/strict'
import { parseSize, readCatalogQuery, matchesDimensions } from '../src/utils/catalogSearch.js'
import { products } from '../src/data/products.js'

test('size search matches exact dimensions, not a text substring', () => {
  const filters = readCatalogQuery({ width: '205', profile: '55', diameter: '16' })
  assert.deepEqual(products.filter(p => matchesDimensions(p, filters)).map(p => p.id), [1])
  assert.deepEqual(products.filter(p => matchesDimensions(p, { width: '205' })).map(p => p.id), [1, 5])
})
test('unknown size gives an empty result instead of a compatibility substitute', () => {
  assert.equal(products.filter(p => matchesDimensions(p, parseSize('245/45 R17'))).length, 0)
})
test('query normalization ignores duplicate and malformed query parameters', () => {
  assert.deepEqual(readCatalogQuery({ width: ['205', '225'], profile: 'bad', diameter: 'R16', season: 'invalid', q: ['a'] }), { q: '', width: '', profile: '', diameter: '', season: 'all' })
  assert.equal(readCatalogQuery({ season: 'winter' }).season, 'winter')
})
test('reset dimensions returns all products', () => {
  assert.equal(products.filter(p => matchesDimensions(p, {})).length, products.length)
})
