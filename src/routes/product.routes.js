const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validate');
const { listProductsRules, productIdRules } = require('../validators/product.validators');
const { list, getOne, getOffers, facets } = require('../controllers/product.controller');

// Public catalog routes (no login needed)
router.get('/', listProductsRules, validate, list);
router.get('/facets', facets); // must stay above '/:id'
router.get('/:id', productIdRules, validate, getOne);
router.get('/:id/offers', productIdRules, validate, getOffers);

module.exports = router;
