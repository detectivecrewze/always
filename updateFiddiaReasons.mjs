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
  const kvId = 'gift-1785216986003';
  console.log(`Fetching gift data for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);
  if (!gift) {
    console.error('Gift not found');
    return;
  }

  gift.reasonsTitle1 = "6 Alasan Kenapa";
  gift.reasonsTitle2 = "Aku Sayang Banget Sama Fiddia";
  gift.reasonsHintAll = "✨ alasan kenapa kamu sangat berarti di hidupku ✨";

  gift.reasons = [
    {
      icon: "😊",
      title: "Bikin Aku Tersenyum",
      desc: "Kehadiran kamu di hidupku selalu bikin hariku jadi lebih terang dan penuh tawa."
    },
    {
      icon: "🤍",
      title: "Selalu Sabar Sama Aku",
      desc: "Terima kasih yaa udah selalu sabar dan menerima aku dengan segala kekuranganku."
    },
    {
      icon: "✨",
      title: "Masa Depan Bareng Kamu",
      desc: "Aku selalu bersemangat menatap masa depan karena tahu ada kamu di sampingku."
    },
    {
      icon: "🤝",
      title: "Janji Setiaku",
      desc: "Aku janji bakal selalu berusaha memberikan yang terbaik dan menjaga hubungan ini."
    },
    {
      icon: "💖",
      title: "Sayangku Nambah Terus",
      desc: "Rasa sayang aku ke Fiddia selalu bertambah hari ini, besok, dan selamanya."
    },
    {
      icon: "👑",
      title: "Kamu Yang Ter-Spesial",
      desc: "Kamu akan selalu jadi sosok paling berharga dan tak tergantikan di hatiku."
    }
  ];

  console.log('Updating Reason Cards to casual & warm style...');
  await cfSet(`gift:${kvId}`, gift);
  console.log('✅ Reason Cards updated successfully!');
}

main().catch(console.error);
