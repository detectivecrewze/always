import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envStr = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envStr.split('\n')) {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
}

const url = env.KV_REST_API_URL;
const token = env.KV_REST_API_TOKEN;

async function kvGet(key) {
  const res = await fetch(`${url}/get/${key}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  if (json.result) {
    return JSON.parse(json.result);
  }
  return null;
}

async function kvSet(key, value) {
  const res = await fetch(`${url}/set/${key}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(value)
  });
  return await res.json();
}

const captions = [
  "Dari segala hal yang tak terduga,",
  "hadirmu adalah kejutan paling indah",
  "yang pernah semesta berikan untukku.",
  "Setiap tawa yang kita bagi,",
  "dan setiap langkah yang kita lalui,",
  "adalah kepingan cerita yang paling aku syukuri.",
  "Meski waktu terus berjalan maju,",
  "rasa ini akan terus bertumbuh untukmu.",
  "Terima kasih sudah mau bertahan,",
  "menjadi tempat ternyaman untukku berpulang.",
  "Mari terus melangkah bersama,",
  "calon teman hidupku selamanya. 🤍"
];

async function run() {
  const draft = await kvGet('draft:auto-30192301');
  if (draft && draft.photos) {
    console.log(`Found ${draft.photos.length} photos in draft`);
    for (let i = 0; i < Math.min(draft.photos.length, captions.length); i++) {
      if (typeof draft.photos[i] === 'string') {
        draft.photos[i] = { url: draft.photos[i], caption: captions[i] };
      } else {
        draft.photos[i].caption = captions[i];
      }
    }
    await kvSet('draft:auto-30192301', draft);
  }

  const order = await kvGet('order:auto-30192301');
  if (order && order.data && order.data.photos) {
    console.log(`Found ${order.data.photos.length} photos in order`);
    for (let i = 0; i < Math.min(order.data.photos.length, captions.length); i++) {
      if (typeof order.data.photos[i] === 'string') {
        order.data.photos[i] = { url: order.data.photos[i], caption: captions[i] };
      } else {
        order.data.photos[i].caption = captions[i];
      }
    }
    await kvSet('order:auto-30192301', order);
  }
  
  const pub = await kvGet('public:nimas');
  if (pub && pub.photos) {
    console.log(`Found ${pub.photos.length} photos in public`);
    for (let i = 0; i < Math.min(pub.photos.length, captions.length); i++) {
      if (typeof pub.photos[i] === 'string') {
        pub.photos[i] = { url: pub.photos[i], caption: captions[i] };
      } else {
        pub.photos[i].caption = captions[i];
      }
    }
    await kvSet('public:nimas', pub);
  }

  console.log("Quotes applied!");
}

run();
