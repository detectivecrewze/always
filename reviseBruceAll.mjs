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

  // 1. Fix gateSubtitle for GateScreen
  giftData.gateSubtitle = giftData.gateTitle || "Something Special For u";

  // 2. Enable Time Section
  giftData.timeEnabled = true;

  // 3. Fix closing section prop
  if (giftData.closingText) {
    giftData.closingParagraph = giftData.closingText;
    delete giftData.closingText;
  } else if (!giftData.closingParagraph) {
    giftData.closingParagraph = "Apapun yang terjadi ke depan, entah jalannya lurus atau berkelok, aku ingin terus berada di sampingmu.";
  }

  // 4. Update reason cards to be more 'santai'
  giftData.reasons = [
    {
      title: "Awal Cerita Kita",
      desc: "Dari awal kenal, aku udah mikir kalo jalani bareng kamu tuh bakal seru banget wkwk."
    },
    {
      title: "Melewati Masalah",
      desc: "Kadang emang banyak drama, tapi kalau dilewatin bareng kamu rasanya jadi lebih ringan aja."
    },
    {
      title: "Jalan Lurus Terus",
      desc: "Walau kadang nggak sesuai ekspektasi, yaudah kita gas jalan lurus terus aja 😂"
    },
    {
      title: "Komitmen Kita",
      desc: "Inget selalu komitmen kita berdua ya, jangan sampai kendor!"
    },
    {
      title: "Tumbuh Bersama",
      desc: "Maaf kalo aku belum bisa banyak bantu kamu berkembang, tapi kita usahain bareng-bareng ya."
    },
    {
      title: "Beli Truck Bareng",
      desc: "Gatau males pengen beli truck... eh tapi boong deng, pengennya sama kamu aja wkwk."
    }
  ];

  console.log('Saving updated gift data...');
  await cfSet(`gift:${kvId}`, giftData);
  await cfSet(`draft:${kvId}`, giftData);

  console.log(`✅ Done! Fixed all remaining issues for ${kvId}.`);
}

main().catch(console.error);
