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

  // Update reason cards to be romantic and sweet, but using casual vocabulary
  giftData.reasons = [
    {
      title: "Hadirmu",
      desc: "Terima kasih ya udah selalu ada di hidupku. Kehadiranmu bener-bener jadi hal terbaik yang pernah terjadi."
    },
    {
      title: "Melewati Masalah",
      desc: "Walaupun kadang kita ngelewatin banyak masalah, aku selalu bersyukur bisa hadapin semuanya bareng kamu."
    },
    {
      title: "Tetap Bersama",
      desc: "Walau kadang realita nggak sesuai harapan, aku cuma mau kita tetap jalan ke depan berdua."
    },
    {
      title: "Komitmen Kita",
      desc: "Apapun rintangannya, tolong selalu ingat komitmen kita ya. Itu yang bakal selalu bikin kita kuat."
    },
    {
      title: "Tumbuh Bersama",
      desc: "Maaf ya kalau aku belum bisa bantu banyak buat kamu berkembang, tapi aku selalu usahain yang terbaik buat kita."
    },
    {
      title: "Hanya Kamu",
      desc: "Sesederhana apapun ucapan ini, intinya aku cuma mau kamu tau kalau aku sayang banget sama kamu."
    }
  ];

  console.log('Saving updated gift data...');
  await cfSet(`gift:${kvId}`, giftData);
  await cfSet(`draft:${kvId}`, giftData);

  console.log(`✅ Done! Fixed reason cards for ${kvId} (Attempt 4).`);
}

main().catch(console.error);
