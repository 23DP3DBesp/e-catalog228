const chatService = require('../services/chat.service');

const MAX_QUESTION_LENGTH = 500;

async function ask(req, res, next) {
  try {
    const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';

    if (!question) {
      return res.status(400).json({ error: 'Please enter a question about tires.' });
    }
    if (question.length > MAX_QUESTION_LENGTH) {
      return res.status(400).json({ error: `The question must be ${MAX_QUESTION_LENGTH} characters or fewer.` });
    }

    res.json({ answer: await chatService.askTireAssistant(question) });
  } catch (err) {
    next(err);
  }
}

module.exports = { ask };