import express from 'express';

const router = express.Router();

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';

/**
 * Triggers an n8n webhook and returns the results directly
 */
router.post('/trigger/:webhookId', async (req, res) => {
    const { webhookId } = req.params;
    const isTest = req.query.test === 'true';

    // n8n webhooks: 'webhook' (production) and 'webhook-test' (test)
    const webhookPath = isTest ? 'webhook-test' : 'webhook';
    const n8nUrl = `${N8N_BASE_URL}/${webhookPath}/${webhookId}`;

    console.log(`Relaying request to n8n: ${n8nUrl}`);

    try {
        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('n8n returned JSON data');
            return res.status(response.status).json(data);
        } else {
            const data = await response.text();
            console.log('n8n returned text data');
            return res.status(response.status).send(data);
        }
    } catch (error) {
        console.error('Failed to trigger n8n:', error);
        res.status(500).json({
            error: 'Failed to communicate with n8n',
            details: error.message
        });
    }
});

export default router;
