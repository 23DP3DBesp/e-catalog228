const { body } = require('express-validator');

// Only displayName can be changed. Anything else in the body (email, role...) is ignored.
const updateProfileRules = [
  body('displayName')
    .isString()
    .withMessage('displayName is required')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('displayName must be 2-50 characters'),
];

module.exports = { updateProfileRules };