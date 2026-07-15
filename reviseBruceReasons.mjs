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
const namespaceId = env.KV_NAMESPACE_ID;
const token = env.CLOUDFLARE_API_TOKEN;

async function cfGet(key) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  return await res.json();
}

async function cfSet(key, value) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(value)
  });
  return res.json();
}

async function main() {
  const kvId = 'gift-1784050734140';
  
  console.log(`Fetching current gift data for ${kvId}...`);
  const giftData = await cfGet(`gift:${kvId}`);
  if (!giftData) {
    console.error(`Error: Could not find gift:${kvId}`);
    return;
  }

  // Update reason cards to be balanced: romantic but conversational
  giftData.reasons = [
    {
      title: "Awal Cerita Kita",
      desc: "Sejak pertama kali kita bareng, rasanya hidupku jauh lebih berwarna dan penuh tawa."
    },
    {
      title: "Melewati Masalah",
      desc: "Kita tahu jalan ini nggak selalu mulus, tapi selama sama kamu, semua rintangan terasa lebih ringan."
    },
    {
      title: "Jalan Terus Lurus",
      desc: "Walau kadang realita nggak sesuai ekspektasi, aku mau terus jalan ke depan asal tetap sama kamu."
    },
    {
      title: "Komitmen Kita",
      desc: "Satu hal yang pasti, komitmen kita berdua adalah pegangan terkuatku saat segalanya terasa berat."
    },
    {
      title: "Tumbuh Bersama",
      desc: "Maaf kalau aku sering kurang sempurna, tapi percayalah aku selalu berusaha jadi versi terbaik buatmu."
    },
    {
      title: "Alasan Bahagiaku",
      desc: "Sesederhana candaan aneh soal beli truck aja bisa bikin bahagia, karena yang terpenting itu sama kamunya."
    }
  ];

  console.log('Saving updated gift data...');
  await cfSet(`gift:${kvId}`, giftData);
  await cfSet(`draft:${kvId}`, giftData);

  console.log(`✅ Done! Fixed reason cards for ${kvId}.`);
}

main().catch(console.error);
