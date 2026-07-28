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
  const orderId = 'ORD-MS3GTWYL';
  const customerName = 'Dandi';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    recipient: "Sese",
    sender: "Dandi",
    theme: "classic-light",
    musicUrl: "FILL_MANUALLY: Bertaut - Nadin Amizah",
    gateSubtitle: "Something Special For u",

    heroPreTitle: "a sincere message from my heart",
    heroLine1: "Untuk Yang Tersayang,",
    heroLine2: "Sese Plincess 🥺💕",
    heroSubtitle: "Sepucuk surat tulus untuk meminta maaf dan mengungkapkan betapa berharganya kamu buat aku.",

    timeEnabled: true,
    timeTitle: "Pesan Dari Hatiku",
    timeSubtitle: "ditulis dengan ketulusan pada",
    timeStartDate: "2026-07-27",

    introPreTitle: "surat dari hati",
    introHeadline1: "Untuk",
    introHeadline2: "Sese Plincess",
    introHeadline3: "Dengan Tulus",
    introText: [
      "Sorryyy banget yaa plincess-kuuu... Jujur akuu enggaa ada maksud sama sekali buat sensii ataupunn marahh ke kamu. Akuu pure santaii dan gak ada niatan sedikit pun buat bikin suasana jadi gak enak. 🥺❤️",
      "Akuu cuma mau kamu tahu kalau akuu sayanggg banget sama kamu. Terkadang kalau ada sikap atau omonganku yang salah bikin kamu bingung, tujuanku gak pernah buat melukai hati Sese.",
      "Maafin aku yaa sayanggg... Makasih udah selalu sabar menghadapi aku. Mari kita perbaiki bareng-bareng dan senyum bahagia lagi. I love you so much, my plincess! 🥺🤍✨"
    ],
    introSignOff: "Dari hatiku yang paling dalam, Dandi",

    reasonsTitle1: "6 Janji & Ketulusan",
    reasonsTitle2: "Dari Hatiku Untuk Sese",
    reasonsHintTap: "ketuk untuk membuka",
    reasonsHintAll: "✨ ungkapan tulus dan janji untukmu ✨",
    reasons: [
      {
        icon: "🥺",
        title: "Permohonan Maaf Tulus",
        desc: "Aku minta maaf yaa sayang kalau sikap atau omonganku sempat bikin kamu sedih."
      },
      {
        icon: "❤️",
        title: "Cinta Yang Selalu Sama",
        desc: "Rasa sayang dan cintaku ke Sese gak pernah berkurang sedikit pun."
      },
      {
        icon: "🤝",
        title: "Janji Lebih Memahami",
        desc: "Aku berjanji akan belajar lebih sabar dan makin mengerti perasaan kamu."
      },
      {
        icon: "✨",
        title: "Plincess Kesayanganku",
        desc: "Kamu akan selalu jadi sosok yang paling spesial dan berharga di hidupku."
      },
      {
        icon: "💬",
        title: "Keterbukaan Hati",
        desc: "Aku akan selalu jujur dan santai dalam komunikasi tanpa ada rasa emosi."
      },
      {
        icon: "🤍",
        title: "Selalu Bersama",
        desc: "Mari kita lewati setiap momen bareng-bareng dengan penuh kehangatan."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Memories",
    galleryHint: "tap to view photos",
    photos: [],

    secretPhoto: secretPhoto || '',
    secretTitle: secretPhoto ? "One More Thing..." : '',
    secretCaption: secretPhoto ? "Maafin aku yaa plincess sayang! I love you so much 🥺❤️" : '',

    closingPreTitle: "always & forever",
    closingTitle1: "Maafkan Aku Yaa,",
    closingTitle2: "Sese Sayang 🥺",
    closingParagraph: "Maafin aku yaa plincess sayang. Terima kasih sudah selalu sabar dan hadir di hidupku. Janji kita bakal senyum dan bahagia bareng-bareng lagi yaa. I love you so much! 💕",
    celebrateBtnText: "tetap sayang ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Sese",
    customerName: customerName,
    theme: "classic-light",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);

  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
