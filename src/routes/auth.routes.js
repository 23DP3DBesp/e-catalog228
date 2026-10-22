const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validate');
const { registerRules, loginRules } = require('../validators/auth.validators');
const { register, login } = require('../controllers/auth.controller');

// POST /api/auth/register
router.post('/register', registerRules, validate, register);

// POST /api/auth/login
router.post('/login', loginRules, validate, login);

module.exports = router;