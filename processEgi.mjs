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
  const kvId = 'auto-h6bq74z';
  const orderId = 'ORD-MRUIA5A1';
  const customerName = 'Egi purba';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 10 words
  const words = ["Selamat", "Ulang", "Tahun", "Sayangku", "Cintaku", "Duniaku", "Dedee", "Airin", "Paling", "Cantik 🤍"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Dedee Airin",
    sender: "Elia",
    theme: "velvet-purple",
    musicUrl: "FILL_MANUALLY: MASA INI, NANTI, DAN MASA INDAH LAINNYA - NUCA",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy Sweet 17,",
    heroLine2: "Dedee Sayang 🤍",
    heroSubtitle: "Hari ini dunia ngerayain manusia paling spesial yang udah bikin hidupku yang tadinya gelap jadi terang benderang.",
    
    timeEnabled: true,
    timeTitle: "Hadirmu di Dunia",
    timeSubtitle: "dunia jadi lebih indah sejak",
    timeStartDate: "2009-07-22",

    introPreTitle: "buat kamu yang paling spesial",
    introHeadline1: "Untuk",
    introHeadline2: "Duniaku",
    introHeadline3: "Tercinta",
    introText: [
      "Happy birthday yahhh dedee 🤍",
      "Sayangku, cintaku, duniakuu, dedeekuuu 🤍😘. Makasih banyak yaa udah jadi bintang terindah di langit hidupku yang dulunya cuma gelap gulita.",
      "Kamu itu nafas, detak jantung, dan satu-satunya alasan aku bisa tersenyum tiap harinya.",
      "Gak ada satu orang pun yang bakal bisa gantikan posisi kamu di hatiku, karena pintunya udah kamu kunci selamanya 🥰🔒",
      "I lovee youuuu dedee Airin 😘🥰🤍, semoga kita bisa ngerayain ulang tahun kamu sama-sama terus ya!"
    ],
    introSignOff: "Penuh cinta, Elia",

    reasonsTitle1: "6 Momen Manis",
    reasonsTitle2: "Bareng Dedee",
    reasonsHintTap: "sentuh kartunya buat buka pesan yaa",
    reasonsHintAll: "✨ hal-hal kecil yang bikin makin sayang ✨",
    reasons: [
      {
        icon: "✨",
        title: "Jadi Bintangku",
        desc: "Momen waktu kamu pertama kali bawa terang di hidupku yang dulunya gelap gulita."
      },
      {
        icon: "🥰",
        title: "Alasan Senyumku",
        desc: "Tiap kali ngeliat kamu, kamu selalu sukses jadi satu-satunya alasan aku tersenyum hari itu."
      },
      {
        icon: "🤍",
        title: "Cintaku Duniaku",
        desc: "Nyadar kalau kamu bukan cuma pacar, tapi kamu itu nafasku, detak jantungku, duniaku."
      },
      {
        icon: "🔒",
        title: "Kunci Hatiku",
        desc: "Waktu sadar kalau posisi kamu di hatiku udah nggak bakal bisa digantiin siapa-siapa lagi."
      },
      {
        icon: "😘",
        title: "Tingkah Gemesmu",
        desc: "Semua kelakuan random dedee yang selalu bikin aku gemes dan makin jatuh cinta."
      },
      {
        icon: "🥳",
        title: "Ulang Tahun Ini",
        desc: "Ngerayain momen sweet 17 kamu bareng-bareng, dan berdoa semoga selamanya bisa terus sama kamu."
      }
    ],

    galleryTitle1: "Kumpulan",
    galleryTitle2: "Memori Kita",
    galleryHint: "ketuk fotonya buat liat lebih deket yaa",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "Satu Lagi...",
    secretCaption: "Udah dikunci selamanya di hatiku 🥰🔒",

    closingPreTitle: "doa buat dedee",
    closingTitle1: "I Love Youuuu",
    closingTitle2: "Selamanya 🤍",
    closingParagraph: "Semoga di umur 17 tahun ini, dedee makin bahagia, makin cantik, dan apa yang dipengenin bisa tercapai semua. Terima kasih ya udah hadir di hidupku. Jangan pernah capek nemenin aku terus ya sayang!",
    celebrateBtnText: "cuddle time ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Dedee Airin",
    customerName: customerName,
    theme: "velvet-purple",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
