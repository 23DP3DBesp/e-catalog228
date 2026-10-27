const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/products', require('./product.routes'));
router.use('/vehicles', require('./vehicle.routes'));
router.use('/orders', require('./order.routes'));
router.use('/favorites', require('./favorite.routes'));
router.use('/chat', require('./chat.routes'));
router.use('/profile', require('./profile.routes'));
router.use('/admin', require('./admin.routes'));

module.exports = router;