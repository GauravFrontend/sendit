import express from 'express';

const router = express.Router();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

const handleOllamaRequest = async (endpoint, req, res) => {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).send(errorText);
        }

        // Handle streaming vs non-streaming
        if (req.body.stream === false) {
            const data = await response.json();
            return res.json(data);
        } else {
            // Proxy stream
            res.setHeader('Content-Type', 'application/x-ndjson');

            const reader = response.body.getReader();

            // Periodically check if client disconnected
            req.on('close', () => {
                reader.cancel();
            });

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
            }
            res.end();
        }
    } catch (error) {
        console.error(`Ollama ${endpoint} proxy error:`, error);
        res.status(500).json({ error: `Failed to communicate with Ollama at ${endpoint}` });
    }
};

router.post('/generate', (req, res) => handleOllamaRequest('generate', req, res));
router.post('/chat', (req, res) => handleOllamaRequest('chat', req, res));

export default router;
