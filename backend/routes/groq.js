import express from 'express';

const router = express.Router();

router.post('/generate', async (req, res) => {
    try {
        const { prompt, model, stream } = req.body;
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Groq API key not configured' });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: model || "llama-3.3-70b-versatile",
                messages: [{ role: 'user', content: prompt }],
                stream: stream === undefined ? true : stream,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json(error);
        }

        if (stream === false) {
            const data = await response.json();
            return res.json(data);
        }

        // Handle streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        req.on('close', () => {
            reader.cancel();
        });

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
        }
        res.end();

    } catch (error) {
        console.error('Groq proxy error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
