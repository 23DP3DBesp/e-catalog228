const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/requireAuth');
const { validate } = require('../middleware/validate');
const { productIdRules } = require('../validators/favorite.validators');
const { list, ids, add, remove } = require('../controllers/favorite.controller');

// Every favorites route needs a logged-in user
router.use(requireAuth);

router.get('/', list); // GET    /api/favorites              my favorite products
router.get('/ids', ids); // GET    /api/favorites/ids          just their ids
router.put('/:productId', productIdRules, validate, add); // PUT    /api/favorites/:productId   add
router.delete('/:productId', productIdRules, validate, remove); // DELETE /api/favorites/:productId   remove

module.exports = router;