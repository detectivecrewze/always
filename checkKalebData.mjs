import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envStr = fs.readFileSync(envPath, 'utf8');
for (const line of envStr.split('\n')) {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    if (!process.env[key]) {
      process.env[key] = rest.join('=').trim().replace(/^"|"$/g, '');
    }
  }
}

import { getGift } from './src/lib/kv.js';

async function main() {
  const kvId = 'auto-30192301';
  let data = await getGift(kvId);
  console.log(JSON.stringify(data, null, 2));
}

main();
