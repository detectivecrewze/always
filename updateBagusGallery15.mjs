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
  
  if (data && data.photos) {
    const galleryWords = [
      "Happy", "Twenty", "Third", "Birthday", "To", 
      "The", "Most", "Beautiful", "Girl", "Who", 
      "Always", "Makes", "Me", "Smile,", "Lesta."
    ];
    
    data.photos = data.photos.map((photo, i) => ({
      ...photo,
      caption: galleryWords[i] || "🤍"
    }));
    
    await putGift(kvId, data);
    console.log("Updated Bagus gallery captions for 15 photos.");
  } else {
    console.log("Data not found!");
  }
}

main();
