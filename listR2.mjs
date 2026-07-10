import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envStr = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envStr.split('\n')) {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
  }
}

const accountId = env.CLOUDFLARE_ACCOUNT_ID;
const token = env.CLOUDFLARE_API_TOKEN;
const bucketName = env.R2_BUCKET_NAME;

async function run() {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects?prefix=orders/for-ega/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok) {
    console.error('Failed:', res.status, await res.text());
    return;
  }
  
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
