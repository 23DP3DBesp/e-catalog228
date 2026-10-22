const { validationResult } = require('express-validator');

// Place after a list of express-validator rules
function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(422).json({
    error: 'Validation failed',
    details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
  });
}

module.exports = { validate };