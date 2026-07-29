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
  const kvId = 'auto-rkqgzz3';
  console.log(`Fetching gift data for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);
  const draft = await cfGet(`draft:${kvId}`);

  if (!gift) {
    console.error('Gift not found');
    return;
  }

  // Update Recipient Name format to Title Case "Adel"
  gift.recipient = "Adel";
  if (draft) {
    draft.recipientName = "Adel";
    await cfSet(`draft:${kvId}`, draft);
  }

  // 1. Time Section: Count forward from relationship date (30 May 2026 -> 2026-05-30)
  gift.timeEnabled = true;
  gift.timeTitle = "Cerita Tentang Kita";
  gift.timeSubtitle = "saling menggenggam dan menyayangi sejak";
  gift.timeStartDate = "2026-05-30";

  // 2. Headlines & Titles (Adel Title Case)
  gift.heroLine1 = "To My Prettiest Girl,";
  gift.heroLine2 = "Adel Cantik 💕";

  gift.introHeadline2 = "Adel Cantik";
  gift.introText = [
    "Happy Girlfriend Day yaa, Adel cantikkuuu 🤍✨ Makasihhh yaa selamaa ini sudahh mauu sabarrr banget sama akuu dan selalu nerimaa semuanya dengan tulus.",
    "Walaupun sekarang kita harus LDR lagii dan terpisah jarak, tapi kamu harus tahu kalau akuu tetapp sayanggg banget sama kamu. Jarak gak akan pernah mengubah perasaan aku ke kamu. 🌌💖",
    "Semangatt jugaa yaa nantii buat kuliahhnyaa! Apapun proses yang bakal kamu lewati, I will always support u and be right here for you. ✨",
    "Tetap jaga kesehatan, jaga senyum manis kamu, dan ingat kalau ada aku yang selalu merindukanmu di sini. Happy Girlfriend Day, my prettiest girl! I love you so much! ❤️✨"
  ];

  // 3. Reasons Section (Bucin / Casual titles & descriptions)
  gift.reasonsTitle1 = "6 Alasan Kenapa";
  gift.reasonsTitle2 = "Aku Sayang Banget Sama Adel";
  gift.reasonsHintAll = "✨ ungkapan tulus untuk cewek paling cantik ✨";

  gift.reasons = [
    {
      icon: "🤍",
      title: "Makasih Udah Sabar",
      desc: "Makasih yaa udah selalu sabar menghadapi aku dan menerima segalanya dengan tulus."
    },
    {
      icon: "🌌",
      title: "LDR Nggak Menghalangi",
      desc: "Walau sekarang kita LDR lagi, rasa sayang aku ke Adel nggak akan pernah berkurang."
    },
    {
      icon: "🎓",
      title: "Bakal Dukung Kuliahmu",
      desc: "Aku bakal selalu dukung dan selalu ada buat kamu di setiap langkah perkuliahan nanti."
    },
    {
      icon: "😊",
      title: "Senyummu Paling Cantik",
      desc: "Senyuman manis kamu selalu sukses bikin hariku jadi lebih hangat dan bahagia."
    },
    {
      icon: "✨",
      title: "Tempat Pulang Nyaman",
      desc: "Terima kasih udah selalu jadi tempat pulang paling nyaman untuk semua ceritaku."
    },
    {
      icon: "👑",
      title: "Cewek Spesialku",
      desc: "Kamu akan selalu jadi cewek paling cantik dan paling berharga nomor satu di hatiku."
    }
  ];

  // 4. Secret Photo & Closing Section
  if (gift.secretCaption) {
    gift.secretCaption = "Happy Girlfriend Day, Adel cantikku! Always love u ❤️";
  }

  gift.closingTitle1 = "Happy Girlfriend Day,";
  gift.closingTitle2 = "Adel Cantik 🌹";
  gift.closingParagraph = "Happy Girlfriend Day once again, Adel cantikku. Thank you for being the most wonderful part of my life. Semangat kuliahnya yaa, I will always support u. I love you so much! ❤️✨";

  console.log('Updating gift payload in KV...');
  await cfSet(`gift:${kvId}`, gift);
  console.log('✅ Raphael & Adel gift updated successfully!');
}

main().catch(console.error);
