import fs from 'fs';
import 'dotenv/config';

const json = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
let key = process.env.GOOGLE_PRIVATE_KEY.trim();
if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
key = key.replace(/\\n/g, '\n');

json.private_key = key;

fs.writeFileSync('service-account.json', JSON.stringify(json, null, 2));
console.log('✅ service-account.json updated with private key');
