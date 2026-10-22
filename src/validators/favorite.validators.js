const { param } = require('express-validator');

const productIdRules = [
  param('productId').isInt({ min: 1 }).withMessage('productId must be a positive integer').toInt(),
];

module.exports = { productIdRules };