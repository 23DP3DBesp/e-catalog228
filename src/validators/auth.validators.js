const { body } = require('express-validator');

const email = body('email')
  .isString()
  .trim()
  .isEmail()
  .withMessage('A valid email is required')
  .customSanitizer((value) => value.toLowerCase());

const registerRules = [
  email,
  body('password')
    .isString()
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be 8-72 characters long'),
  body('displayName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be 2-50 characters long'),
];

const loginRules = [
  email,
  body('password').isString().bail().notEmpty().withMessage('Password is required'),
];

module.exports = { registerRules, loginRules };
