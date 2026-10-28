const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/requireAuth');
const { requireRole } = require('../middleware/requireRole');
const { validate } = require('../middleware/validate');
const { listOrdersRules, listUsersRules, updateOrderStatusRules } = require('../validators/admin.validators');
const { listUsers } = require('../controllers/admin.controller');
const { list: listOrders, updateStatus } = require('../controllers/adminorder.controller');

// Everything under /api/admin is admin only
router.use(requireAuth, requireRole('admin'));

router.get('/users', listUsersRules, validate, listUsers); // GET   /api/admin/users?page=&limit=
router.get('/orders', listOrdersRules, validate, listOrders); // GET   /api/admin/orders?status=&page=&limit=
router.patch('/orders/:id/status', updateOrderStatusRules, validate, updateStatus); // PATCH /api/admin/orders/:id/status  { status }

module.exports = router;