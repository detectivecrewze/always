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
  const kvId = 'auto-gpjvlo4';
  const orderId = 'ORD-MRW8O5HL';
  const customerName = 'Cyaaaa';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 15 words
  const words = [
    "Happy", "Twentieth", "Birthday", "Lafka", "Sayang",
    "Terima", "Kasih", "Sudah", "Bawa", "Warna",
    "Indah", "Dalam", "Hidupku", "Ya", "🤍"
  ];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Lafka Sayang",
    sender: "Cyaaaa",
    theme: "classic-light",
    musicUrl: "FILL_MANUALLY: Until I Found You",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy 20th Birthday,",
    heroLine2: "Lafka Sayang 🤍",
    heroSubtitle: "Merayakan keberadaanmu, sosok yang hadir membawa warna baru dan meluluhkan hatiku.",
    
    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing joy and warmth into the world since",
    timeStartDate: "2006-08-20",

    introPreTitle: "a letter from the heart",
    introHeadline1: "Untuk",
    introHeadline2: "Lafka",
    introHeadline3: "Tersayang",
    introText: [
      "Kalau dipikir-pikir, lucu juga ya awal kita bisa ketemu. Semua berawal dari ketidaksengajaan. Waktu itu, buat aku kamu cuma teman biasa, dan aku sama sekali nggak punya rasa atau kepikiran kalau suatu hari kita bakal sedekat ini.",
      "Tapi ternyata, kamu udah lebih dulu punya rasa. Kamu nggak banyak ngomong, tapi milih nunjukin semuanya lewat tindakan. Pelan-pelan, perhatian dan konsistensi kamu bikin tembok yang aku bangun runtuh.",
      "Aku luluh karena action nyata yang kamu kasih. Dari situ aku mulai melihat kamu dengan cara yang berbeda, sampai akhirnya seseorang yang dulu cuma teman, sekarang jadi orang yang paling berarti buat aku.",
      "Di hari ulang tahunmu ini, terima kasih sudah hadir dan jadi alasan aku belajar arti dicintai, dihargai, dan disayangi dengan tulus.",
      "Aku sadar perjalanan kita nggak selalu mudah, ada banyak perbedaan termasuk keyakinan di antara kita. Tapi aku bersyukur kita masih memilih untuk saling menjaga dan mengusahakan satu sama lain.",
      "Selama masih ada kesempatan untuk berjalan bersama, aku akan tetap mendoakan yang terbaik untukmu. Semoga di usia yang baru ini kamu selalu diberi kesehatan, kebahagiaan, dan impianmu terwujud.",
      "Terima kasih sudah jadi Lafka yang aku kenal hari ini: baik, rendah hati, dan pekerja keras. Happy Birthday, sayang. 🤍"
    ],
    introSignOff: "With all my love, Cya",

    reasonsTitle1: "6 Moments That",
    reasonsTitle2: "Made Us",
    reasonsHintTap: "tap the card to reveal",
    reasonsHintAll: "✨ our precious memories ✨",
    reasons: [
      {
        icon: "🌱",
        title: "Accidental Beginning",
        desc: "Siapa sangka sosok yang dulu cuma aku anggap teman biasa, sekarang jadi yang paling berarti."
      },
      {
        icon: "🤍",
        title: "Action Over Words",
        desc: "Usaha dan perhatian konsistenmu yang pelan-pelan bikin tembok di hatiku runtuh."
      },
      {
        icon: "✨",
        title: "Sincerely Loved",
        desc: "Makasih udah hadir dan ngajarin aku rasanya dicintai dan dihargai sedalam ini."
      },
      {
        icon: "🤝",
        title: "Choosing Each Other",
        desc: "Meski ada perbedaan di antara kita, aku bersyukur kita tetap memilih berjuang bareng."
      },
      {
        icon: "🚀",
        title: "Proud of You",
        desc: "Aku selalu bangga ngelihat kamu yang pekerja keras dan rendah hati dalam ngejar mimpi."
      },
      {
        icon: "🎨",
        title: "A Whole New World",
        desc: "Kehadiranmu bener-bener bawa warna baru dan kebahagiaan indah yang tak tergantikan."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap untuk memperbesar",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy 20th Birthday, Lafka sayang! ❤️",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy",
    closingTitle2: "Birthday 🎂",
    closingParagraph: "Sekali lagi happy birthday Lafka sayang. Semoga apa pun yang terjadi nanti, kamu selalu ingat kalau pernah ada seseorang yang sangat bersyukur dipertemukan denganmu. Terima kasih sudah ada dan membawa warna indah dalam hidupku. You mean so much to me! 🤍",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Lafka Sayang",
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
