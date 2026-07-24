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
  const kvId = 'auto-dfj1b8s';
  const orderId = 'ORD-MRYODO2U';
  const customerName = 'Your wife sheilla cantik';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    recipient: "Davin Lutfi (Hubby)",
    sender: "Your Wife Sheilla & Dede Arshan",
    theme: "midnight-blue",
    musicUrl: "FILL_MANUALLY: Sampai Jadi Debu - Banda Neira",
    gateSubtitle: "Something Special For u",
    
    heroPreTitle: "to my dearest husband",
    heroLine1: "Happy 23rd Birthday,",
    heroLine2: "Davin Hubby ❤️",
    heroSubtitle: "Merayakan 23 tahun perjalananmu, sosok suami dan ayah hebat yang sangat kami cintai.",
    
    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing light and warmth into the world since",
    timeStartDate: "2003-07-25",

    introPreTitle: "a letter for my husband",
    introHeadline1: "Untuk",
    introHeadline2: "Davin Hubby",
    introHeadline3: "Tersayang",
    introText: [
      "Hai suami! Gimana kabarnya? Aku harap kamu selalu baik-baik aja yaa disana. Selamat ulang tahun yaa! 🤍",
      "Maaf yaa kalau aku belum bisa jadi istri yang baik dan sempurna buat kamu.",
      "Doa aku, semoga kamu selalu sehat dan diberi keselamatan selalu di sana.",
      "Semoga kamu makin dewasa dan lebih bijak lagi menghadapi semua masalah rumah tangga kita ke depannya.",
      "Semoga selalu diberikan rasa sayang dan cinta ke aku sama Dede Arshan.",
      "7 tahun kenal kamu, 6 tahun bareng kamu dengan semua drama hubungan susah, senang, bahagia, dan tangisan yang udah kita lewatin, aku selalu berdoa semoga kamu selalu diberi rasa sayang, syukur, dan cinta ke aku juga Dede Arshan.",
      "Semoga keluarga kecil kita selalu dijauhkan dari segala hal yang memecah belah kebahagiaan keluarga kita yaa.",
      "We love you so much from your wife and your son, and see you in 2027 luv! 💗"
    ],
    introSignOff: "With all our love, Sheilla & Dede Arshan",

    reasonsTitle1: "6 Beautiful",
    reasonsTitle2: "Moments of Us",
    reasonsHintTap: "tap the card to reveal",
    reasonsHintAll: "✨ precious journey we shared ✨",
    reasons: [
      {
        icon: "💍",
        title: "Building Our Family",
        desc: "Makasih udah jadi suami dan papa yang hebat buat aku dan Dede Arshan."
      },
      {
        icon: "⌛",
        title: "6 Years Together",
        desc: "7 tahun kenal dan 6 tahun bareng melewati susah senang dan tangisan bersama."
      },
      {
        icon: "🤍",
        title: "Unconditional Love",
        desc: "Semoga rasa sayang, syukur, dan cinta kamu buat keluarga kecil kita selalu tumbuh."
      },
      {
        icon: "🛡️",
        title: "Protecting Our Home",
        desc: "Semoga keluarga kita selalu dijauhkan dari segala hal pemecah belah kebahagiaan."
      },
      {
        icon: "🌱",
        title: "Growing Stronger",
        desc: "Semoga kamu makin bijak dan dewasa menghadapi setiap ujian rumah tangga."
      },
      {
        icon: "✈️",
        title: "See You In 2027",
        desc: "Aku dan Dede Arshan selalu mendoakan keselamatanmu di sana dan nungguin kamu pulang."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to enlarge",
    photos: [],

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy 23rd Birthday, Hubby! See you in 2027 💗",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 23rd",
    closingTitle2: "Birthday 🎂",
    closingParagraph: "Happy 23rd Birthday once again, Hubby. Terima kasih sudah menjadi suami dan ayah yang luar biasa untuk aku dan Dede Arshan. Semoga kamu sehat dan selamat selalu di sana. We love you so much and see you in 2027! 💗",
    celebrateBtnText: "see you in 2027 ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Davin Lutfi (Hubby)",
    customerName: customerName,
    theme: "midnight-blue",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
