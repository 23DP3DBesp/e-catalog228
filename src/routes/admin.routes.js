const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/requireAuth');
const { requireRole } = require('../middleware/requireRole');
const { listUsers } = require('../controllers/admin.controller');

// GET /api/admin/users  (admin only)
router.get('/users', requireAuth, requireRole('admin'), listUsers);

module.exports = router;
