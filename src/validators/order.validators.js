const { body, param } = require('express-validator');

const text = (field, min, max) =>
  body(field)
    .isString()
    .withMessage(`${field} is required`)
    .bail()
    .trim()
    .isLength({ min, max })
    .withMessage(`${field} must be ${min}-${max} characters`);

// Only these fields are read from the request. Anything else the client sends
// (prices, totals, user ids...) is ignored.
const createOrderRules = [
  body('items').isArray({ min: 1, max: 20 }).withMessage('items must be a list of 1-20 entries'),
  body('items.*.offerId').isInt({ min: 1 }).withMessage('offerId must be a positive integer').toInt(),
  body('items.*.quantity').isInt({ min: 1, max: 20 }).withMessage('quantity must be 1-20').toInt(),
  body('customer').isObject().withMessage('customer is required'),
  text('customer.fullName', 2, 100),
  body('customer.phone')
    .isString()
    .withMessage('customer.phone is required')
    .bail()
    .trim()
    .matches(/^\+?[0-9 ()-]{7,20}$/)
    .withMessage('customer.phone is not a valid phone number'),
  text('customer.address', 5, 200),
  text('customer.city', 2, 100),
  text('customer.postalCode', 3, 20),
];

const orderIdRules = [param('id').isInt({ min: 1 }).withMessage('id must be a positive integer').toInt()];

module.exports = { createOrderRules, orderIdRules };