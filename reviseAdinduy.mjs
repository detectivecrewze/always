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
  const kvId = 'auto-x4ldzjf';

  console.log(`Fetching latest gift data for ${kvId}...`);
  const giftData = await cfGet(`gift:${kvId}`);
  
  if (!giftData) {
    console.error('Gift data not found!');
    return;
  }

  // Revise reasons to be more casual and less formal
  giftData.reasons = [
    {
      title: 'The Best Boss',
      desc: 'Makasih ya kak buat semua waktu dan tenaganya buat aku selama ini.'
    },
    {
      title: 'Orang yang Baik',
      desc: 'Harapanku kakak bakal selalu jadi cowok yang baik buat siapa aja.'
    },
    {
      title: 'Penuh Syukur',
      desc: 'Bersyukur banget deh aku bisa kenal dan deket sama kakak.'
    },
    {
      title: 'Hebatnya Kamu',
      desc: 'Keren banget kakak bisa ngelewatin semua up and down selama ini.'
    },
    {
      title: 'Future Great Dad',
      desc: 'Sekarang jadi anak yang baik, kelak pasti jadi ayah yang hebat juga ✨'
    },
    {
      title: 'Bermanfaat Bagi Semua',
      desc: 'Semoga kakak selalu bisa ngasih manfaat buat banyak orang yaa.'
    }
  ];

  // Revise closing paragraph
  giftData.closingParagraph = 'semoga akan selalu ada jutaan kebahagiaan, ketenangan, dan kesuksesan didepan sana yaa kaak.. Once again, Happy 24th Birthday My Baby Boy Bosfik! 💗';

  console.log('Saving revised gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log(`✅ Done! Revisions for ${kvId} have been saved successfully.`);
}

main().catch(console.error);
