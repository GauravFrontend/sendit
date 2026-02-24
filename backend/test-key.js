import crypto from 'crypto';
import 'dotenv/config';

async function test() {
    const raw = process.env.GOOGLE_PRIVATE_KEY;

    let clean = raw.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) clean = clean.slice(1, -1);
    clean = clean.replace(/\\n/g, '\n');

    const header = "-----BEGIN PRIVATE KEY-----";
    const footer = "-----END PRIVATE KEY-----";

    const content = clean.substring(clean.indexOf(header) + header.length, clean.indexOf(footer));
    // Remove ALL whitespace and any potential hidden characters like \r
    const base64 = content.replace(/[^A-Za-z0-9+/=]/g, '');

    console.log('Final Base64 length:', base64.length);

    try {
        const buffer = Buffer.from(base64, 'base64');
        const key = await crypto.subtle.importKey(
            'pkcs8',
            buffer,
            { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
            false,
            ['sign']
        );
        console.log('✅ Success with SubtleCrypto!');
    } catch (e) {
        console.log('❌ Failed with SubtleCrypto:', e.message);

        try {
            // Try with createPrivateKey and legacy flag (simulated)
            const k = crypto.createPrivateKey({
                key: clean,
                format: 'pem',
                type: 'pkcs8'
            });
            console.log('✅ Success with createPrivateKey!');
        } catch (e2) {
            console.log('❌ Failed with createPrivateKey:', e2.message);
        }
    }
}

test();
