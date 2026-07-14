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

  // Revise only the reasons section to a new theme (Doa & Rasa Syukur)
  giftData.reasons = [
    {
      title: 'Rasa Syukurku',
      desc: 'Seneng banget bisa kenal dan punya kesempatan buat deket sama kakak.'
    },
    {
      title: 'Terima Kasih Kak!',
      desc: 'Makasih buat semua waktu, tenaga, dan bantuannya selama ini yaa.'
    },
    {
      title: 'Kuatnya Kakak',
      desc: 'Hebat banget bisa bertahan ngelewatin semua lika-liku dan up & down sejauh ini.'
    },
    {
      title: 'Doa Umur Panjang',
      desc: 'Semoga di umur baru ini kakak selalu sehat, bahagia, dan berkah terus hidupnya.'
    },
    {
      title: 'Masa Depan Indah',
      desc: 'Harapanku kakak bisa dapet kehidupan yang stabil dan sukses terus ke depannya.'
    },
    {
      title: 'Stay Jadi Orang Baik',
      desc: 'Apapun yang terjadi, semoga kakak selalu jadi cowok yang baik buat siapa pun.'
    }
  ];

  console.log('Saving revised gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log(`✅ Done! Revisions for ${kvId} have been saved successfully.`);
}

main().catch(console.error);
