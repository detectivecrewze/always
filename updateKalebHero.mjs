import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envStr = fs.readFileSync(envPath, 'utf8');
for (const line of envStr.split('\n')) {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    process.env[key.trim()] = rest.join('=').trim();
  }
}

const { createClient } = await import('@vercel/kv');
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

async function run() {
  const data = await kv.get('draft:auto-30192301');
  if (data) {
    data.heroLine1 = "For My Beautiful";
    data.heroLine2 = "Future Wife";
    await kv.set('draft:auto-30192301', data);
    console.log("Updated auto-30192301 draft");
  }
  
  const order = await kv.get('order:auto-30192301');
  if (order && order.data) {
    order.data.heroLine1 = "For My Beautiful";
    order.data.heroLine2 = "Future Wife";
    await kv.set('order:auto-30192301', order);
    console.log("Updated auto-30192301 order");
  }
  
  // Also check public gift if it exists
  const pub = await kv.get('public:nimas');
  if (pub) {
    pub.heroLine1 = "For My Beautiful";
    pub.heroLine2 = "Future Wife";
    await kv.set('public:nimas', pub);
    console.log("Updated public:nimas");
  }
  
  console.log("Done");
}

run();
