const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validate');
const { modelsRules, yearsRules, modificationsRules } = require('../validators/vehicle.validators');
const { brands, models, years, modifications } = require('../controllers/vehicle.controller');

// Public routes. Each step narrows the previous one:
// brand -> model -> year -> modification (with tire size)
router.get('/brands', brands);
router.get('/models', modelsRules, validate, models);
router.get('/years', yearsRules, validate, years);
router.get('/modifications', modificationsRules, validate, modifications);

module.exports = router;