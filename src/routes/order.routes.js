const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/requireAuth');
const { validate } = require('../middleware/validate');
const { createOrderRules, orderIdRules } = require('../validators/order.validators');
const { create, list, getOne } = require('../controllers/order.controller');

// Every order route needs a logged-in user
router.use(requireAuth);

router.post('/', createOrderRules, validate, create); // POST /api/orders
router.get('/', list); // GET  /api/orders        (my orders)
router.get('/:id', orderIdRules, validate, getOne); // GET  /api/orders/:id

module.exports = router;