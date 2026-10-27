const express = require('express');
const router = express.Router();
const { rateLimit } = require('../middleware/ratelimit');
const { ask } = require('../controllers/chat.controller');

// Public, but limited so nobody can run up the AI bill: 10 questions per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many questions, please wait a minute and try again.',
});

router.post('/', chatLimiter, ask); // POST /api/chat  { question }

module.exports = router;