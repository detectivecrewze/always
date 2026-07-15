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

  // Update reason cards to perfectly match the customer's unique vibe
  giftData.reasons = [
    {
      title: "Makasih Udah Ada",
      desc: "Makasih banyak ya udah selalu ada di hidupku. Kehadiranmu beneran berarti banget buat aku."
    },
    {
      title: "Banyak Masalah wkwk",
      desc: "Walau kadang kita banyak masalah dan drama wkwk, aku tetep seneng bisa lewatin semuanya bareng kamu."
    },
    {
      title: "Jalan Lurus Aja",
      desc: "Kalo kadang nggak sesuai sama yang kita pengen, yaudah kita gas jalan lurus aja 😭🤣."
    },
    {
      title: "Selalu Komitmen",
      desc: "Pokoknya kita jalani sesuai apa yang kita mau, dan harus selalu inget sama komitmen kita berdua ya."
    },
    {
      title: "Tumbuh Bareng",
      desc: "Maaf ya kalo aku belum bisa banyak bantu kamu berkembang, tapi kita usahain semuanya bareng-bareng."
    },
    {
      title: "Pengen Beli Truck",
      desc: "Yaudah gitu aja pesannya, gatau lagi mau ngetik apa males pengen beli truck aja wkwk 🤣."
    }
  ];

  console.log('Saving updated gift data...');
  await cfSet(`gift:${kvId}`, giftData);
  await cfSet(`draft:${kvId}`, giftData);

  console.log(`✅ Done! Fixed reason cards for ${kvId} (Attempt 3).`);
}

main().catch(console.error);
