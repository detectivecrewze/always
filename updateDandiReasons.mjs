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
  const kvId = 'auto-juzw91q';
  console.log(`Fetching gift data for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);
  if (!gift) {
    console.error('Gift not found');
    return;
  }

  gift.reasonsTitle1 = "6 Alasan Kenapa";
  gift.reasonsTitle2 = "Akuu Sayang Banget Sama Sese";
  gift.reasonsHintAll = "✨ alasan kenapa plincess berharga banget buat akuu ✨";

  gift.reasons = [
    {
      icon: "🥺",
      title: "Akuu Minta Maaf Yaa",
      desc: "Sorryyy banget yaa sayangg kalau sikap atau omonganku kemarin sempat bikin kamu sedih."
    },
    {
      icon: "❤️",
      title: "Sayanggg Banget Sama Kamu",
      desc: "Rasa sayang dan cinta akuu ke Sese gak akan pernah berkurang sedikit pun."
    },
    {
      icon: "🤝",
      title: "Bakal Lebih Mengerti Kamu",
      desc: "Akuu janji bakal belajar lebih sabar dan makin mengerti perasaan plincess-ku."
    },
    {
      icon: "✨",
      title: "Selalu Jadi Yang Ter-Spesial",
      desc: "Kamu akan selalu jadi sosok paling spesial dan paling berharga di hidup akuu."
    },
    {
      icon: "💬",
      title: "Komunikasi Santai Terus",
      desc: "Akuu pure santaii dan bakal selalu tulus ngobrol tanpa ada emosi sama sekali."
    },
    {
      icon: "🤍",
      title: "Berjuang Bareng-Bareng",
      desc: "Yuk lewati setiap harinya bareng-bareng lagi dengan penuh senyuman dan kehangatan."
    }
  ];

  console.log('Updating Reason Cards to Bucin / ABG style...');
  await cfSet(`gift:${kvId}`, gift);
  console.log('✅ Reason Cards updated successfully!');
}

main().catch(console.error);
