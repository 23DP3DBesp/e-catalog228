const { body, param, query } = require('express-validator');

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const single = (name) =>
  query(name)
    .optional()
    .custom((value) => typeof value === 'string')
    .withMessage(`${name} must be a single value`)
    .bail();

const listOrdersRules = [
  single('status').isIn(STATUSES),
  single('page').isInt({ min: 1 }).toInt(),
  single('limit').isInt({ min: 1, max: 100 }).toInt(),
];

const updateOrderStatusRules = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer').toInt(),
  body('status')
    .isString()
    .withMessage('status is required')
    .bail()
    .isIn(STATUSES)
    .withMessage(`status must be one of: ${STATUSES.join(', ')}`),
];

module.exports = { listOrdersRules, updateOrderStatusRules };