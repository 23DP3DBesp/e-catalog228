const { query } = require('express-validator');

// A required, single text value taken from the query string
const text = (name) =>
  query(name)
    .custom((value) => typeof value === 'string')
    .withMessage(`${name} is required`)
    .bail()
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage(`${name} is required (max 80 characters)`);

const modelsRules = [text('brand')];
const yearsRules = [text('brand'), text('model')];
const modificationsRules = [
  text('brand'),
  text('model'),
  query('year')
    .custom((value) => typeof value === 'string')
    .withMessage('year is required')
    .bail()
    .isInt({ min: 1900, max: 2100 })
    .withMessage('year must be a valid year')
    .toInt(),
];

module.exports = { modelsRules, yearsRules, modificationsRules };