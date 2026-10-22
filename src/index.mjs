import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10kb' }));

app.post('/api/chat', (req, res) => {
    const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';

    if (!question) {
        return res.status(400).json({ error: 'Please enter a question about tires.' });
    }

    if (question.length > 500) {
        return res.status(400).json({ error: 'The question must be 500 characters or fewer.' });
    }

    // The AI provider will be called here. Its system instructions must keep
    // answers limited to tires and tire-related vehicle fitment questions.
    return res.status(503).json({ error: 'The tire chat API is not connected yet.' });
});

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
});
