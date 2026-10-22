const { query, param } = require('express-validator');

const SEASONS = ['summer', 'winter', 'all-season'];
const GRADES = ['A', 'B', 'C', 'D', 'E'];
const SORTS = ['featured', 'price-low', 'price-high', 'brand', 'popular'];

// Rejects repeated (?x=1&x=2) or nested (?x[a]=1) values for params that take one value
const single = (name) =>
  query(name)
    .optional()
    .custom((value) => typeof value === 'string')
    .withMessage(`${name} must be a single value`)
    .bail();

const listProductsRules = [
  single('q').isLength({ max: 100 }).withMessage('q is too long'),
  single('season').isIn(SEASONS),
  single('width').isInt({ min: 100, max: 400 }).toInt(),
  single('profile').isInt({ min: 20, max: 100 }).toInt(),
  single('diameter').isInt({ min: 10, max: 30 }).toInt(),
  query('brand')
    .optional()
    .customSanitizer((value) => [].concat(value))
    .custom((brands) => brands.every((b) => typeof b === 'string' && b.length > 0 && b.length < 80))
    .withMessage('brand must be text up to 80 characters'),
  single('maxPrice').isFloat({ min: 0 }).toFloat(),
  single('load').matches(/^\d{2,3}$/).withMessage('load must be 2-3 digits'),
  single('speed').isIn(['H', 'T', 'V', 'W', 'Y']),
  single('fuel').isIn(GRADES),
  single('wet').isIn(GRADES),
  single('noise').isInt({ min: 50, max: 90 }).toInt(),
  single('available').isIn(['1']).withMessage('available must be 1').customSanitizer(() => true),
  single('studs').isIn(['yes', 'no']),
  single('marking').isIn(['3PMSF', 'M+S']),
  single('sort').isIn(SORTS),
  single('page').isInt({ min: 1 }).toInt(),
  single('limit').isInt({ min: 1, max: 50 }).toInt(),
];

const productIdRules = [param('id').isInt({ min: 1 }).withMessage('id must be a positive integer').toInt()];

module.exports = { listProductsRules, productIdRules };
