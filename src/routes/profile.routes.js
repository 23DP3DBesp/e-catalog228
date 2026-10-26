const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/requireAuth');
const { validate } = require('../middleware/validate');
const { updateProfileRules } = require('../validators/profile.validators');
const { getProfile, updateProfile } = require('../controllers/profile.controller');

router.use(requireAuth);

router.get('/', getProfile); // GET   /api/profile
router.patch('/', updateProfileRules, validate, updateProfile); // PATCH /api/profile  { displayName }

module.exports = router;