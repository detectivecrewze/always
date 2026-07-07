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

import { getGift, putGift } from './src/lib/kv.js';

async function updateRecipient(kvId, recipientName) {
  let data = await getGift(kvId);
  if (data) {
    data.recipient = recipientName;
    await putGift(kvId, data);
    console.log(`Updated recipient for ${kvId} to ${recipientName}`);
  }
}

async function main() {
  await updateRecipient('auto-30192301', 'Nimas');
  await updateRecipient('auto-1092012', 'Lesta');
  await updateRecipient('for-kaka', 'Kaka');
  await updateRecipient('gift-1783227608900', 'Ayu Indryani');
  await updateRecipient('for-ken', 'Ken');
  await updateRecipient('for-0938201', 'Ami');
}

main();
