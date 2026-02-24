import express from 'express';
import { JWT } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account from JSON file
const serviceAccount = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../service-account.json'), 'utf8')
);

const auth = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function apiCall(endpoint, method = 'GET', body = null) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);

    // google-auth-library handles token refresh and injection automatically
    return auth.request({ url, ...options });
}

router.get('/sync', async (req, res) => {
    console.log('--- Fetching All Rows from Sheet ---');
    try {
        const sheetId = process.env.GOOGLE_SHEET_ID;
        if (!sheetId) return res.status(400).json({ error: 'Sheet ID not configured' });

        const response = await apiCall(`${sheetId}/values/A:H`); // Fetch up to column H (Record Lead Time)
        const rows = response.data.values || [];

        // Skip header row
        const data = rows.slice(1).map((row, index) => ({
            name: row[0] || '',
            email: row[1] || '',
            status: row[2] || '',
            time: row[3] || '',
            location: row[4] || '',
            profile: row[5] || '', // Profile URL
            phone: row[6] || '',    // Phone
            recordTime: row[7] || '', // Record Lead Time
            synced: true,
            id: `sheet-${index}`
        }));

        res.json({ leads: data });
    } catch (error) {
        console.error('❌ Fetch Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.post('/sync', async (req, res) => {
    console.log('--- Google Sheets Sync Started ---');
    try {
        const { leads } = req.body;
        const sheetId = process.env.GOOGLE_SHEET_ID;

        if (!sheetId) {
            console.error('❌ Missing GOOGLE_SHEET_ID');
            return res.status(400).json({ error: 'Sheet ID not configured' });
        }

        if (!leads || !Array.isArray(leads)) {
            console.error('❌ Invalid data:', leads);
            return res.status(400).json({ error: 'Invalid leads data' });
        }

        console.log(`Syncing ${leads.length} leads to Sheet: ${sheetId}`);

        // 1. Check/Add Headers
        const check = await apiCall(`${sheetId}/values/A1:Z1`);
        const headers = ['Name', 'Email', 'Send Status', 'Time', 'Location', 'Profile URL', 'Phone', 'Record Lead Time'];

        if (!check.data.values || check.data.values.length === 0) {
            console.log('Sheet is empty. Adding header row...');
            await apiCall(`${sheetId}/values/A1?valueInputOption=RAW`, 'PUT', {
                values: [headers]
            });
        }

        // 2. Format and Append Rows
        const rows = leads.map(l => {
            const recordTimeStr = new Date().toLocaleString('en-GB');
            return [
                l.name || '',
                l.email || '',
                '', // Send Status (empty)
                '', // Time (Requested to be left empty)
                l.location || '',
                l.profile || '', // Profile URL
                l.phone || '',   // Phone
                recordTimeStr    // Record Lead Time
            ];
        });

        console.log('Appending rows...');
        await apiCall(`${sheetId}/values/A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, 'POST', {
            values: rows
        });

        console.log('✅ Sync Success!');
        res.json({ success: true, message: `Successfully synced ${leads.length} leads` });

    } catch (error) {
        console.error('❌ Sync Error:', error.message);
        res.status(500).json({ error: error.message });
    }
    console.log('--- Sync Finished ---');
});

export default router;
