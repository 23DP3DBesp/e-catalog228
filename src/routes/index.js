const express = require('express');
const router = express.Router();

router.use('/profile', require('./profile.routes'));
router.use('/admin', require('./admin.routes'));

module.exports = router;