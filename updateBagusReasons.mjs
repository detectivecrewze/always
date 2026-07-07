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

async function main() {
  const kvId = 'auto-1092012';
  let data = await getGift(kvId);
  
  if (data && data.reasons) {
    // Add two more items to make it 6
    data.reasons = [
      ...data.reasons,
      {
        title: "Beautiful Mind",
        desc: "As time goes by, aku harap kamu terus memancarkan pesona indah yang selalu mencerahkan hariku."
      },
      {
        title: "Strong Roots",
        desc: "Sama seperti bunga yang kokoh, I know you will stay strong menghadapi segala tantangan di depan sana."
      }
    ];
    
    await putGift(kvId, data);
    console.log("Updated Bagus's reasons to be 6 cards.");
  } else {
    console.log("Data not found!");
  }
}

main();
