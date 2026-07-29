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
  const orderId = 'ORD-MS493EBH';
  const customerName = 'Rafa Ardiansyah';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const words = [
    "Selamat", "Ulang", "Tahun", "Gadis", "Paling",
    "Cantik", "Dan", "Spesial", "Kesayanganku", "🤍"
  ];

  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Fiddia Aissatur Risqi",
    sender: "Rafa Ardiansyah",
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: Shape of my heart - Backstreet Boys",
    gateSubtitle: "Something Special For u",

    pinEnabled: true,
    pinCode: "290707",
    pinHint: "290707",

    heroPreTitle: "a special 19th birthday wish",
    heroLine1: "Happy 19th Birthday,",
    heroLine2: "My Dearest Fiddia 💕",
    heroSubtitle: "19 beautiful years of your presence making the world a brighter place.",

    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing warmth & sweetness into the world since",
    timeStartDate: "2007-07-29",

    introPreTitle: "surat dari hati",
    introHeadline1: "Untuk",
    introHeadline2: "Fiddia Aissatur Risqi",
    introHeadline3: "Sayangku Tersayang",
    introText: [
      "Selamat ulang tahun yang ke-19 yaa, sayangkuuu 🤍🎉 Semoga di usia yang baru ini kamu selalu diberi kesehatan, kebahagiaan, umur yang panjang, rezeki yang lancar, dan semua impianmu bisa segera terwujud satu per satu.",
      "Terima kasih yaa sayang karena sudah hadir di hidupku dan selalu menjadi alasan utama aku tersenyum setiap hari. Bersamamu, aku belajar betapa indahnya dicintai dengan tulus. ✨",
      "Semoga apa pun yang kita impikan bersama bisa tercapai yaa, dan semoga hubungan kita selalu diberi kebahagiaan, kesetiaan, serta langgeng sampai masa depan nanti. Aku bakal selalu berusaha menjadi yang terbaik buat kamu.",
      "Sekali lagi, selamat ulang tahun cintakuuu. Tetap jadi pribadi yang baik dan jangan pernah berhenti tersenyum yaa. Aku sayang banget sama kamu, hari ini, besok, dan seterusnya. Happy 19th Birthday, my love! ❤️✨"
    ],
    introSignOff: "Selalu milikmu, Rafa Ardiansyah",

    reasonsTitle1: "6 Alasan Kenapa",
    reasonsTitle2: "Akuu Sayang Banget Sama Fiddia",
    reasonsHintTap: "ketuk untuk membaca",
    reasonsHintAll: "✨ ungkapan tulus dan alasan kenapa kamu sangat berarti ✨",
    reasons: [
      {
        icon: "😊",
        title: "Alasan Utama Tersenyum",
        desc: "Kehadiran kamu di hidupku selalu bikin hariku jadi lebih terang dan penuh tawa."
      },
      {
        icon: "🤍",
        title: "Ketulusan Dan Kesabaran",
        desc: "Terima kasih udah selalu sabar dan menerima aku dengan segala kekuranganku."
      },
      {
        icon: "✨",
        title: "Impian Bersama",
        desc: "Aku selalu bersemangat menatap masa depan karena tahu ada kamu di sampingku."
      },
      {
        icon: "🤝",
        title: "Kesetiaan Tanpa Syarat",
        desc: "Janji aku bakal selalu berusaha memberikan yang terbaik dan menjaga hubungan ini."
      },
      {
        icon: "💖",
        title: "Cinta Yang Selalu Bertambah",
        desc: "Rasa sayangku ke Fiddia selalu bertambah hari ini, besok, dan selamanya."
      },
      {
        icon: "👑",
        title: "My One And Only",
        desc: "Kamu akan selalu jadi sosok paling berharga dan tak tergantikan di hatiku."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Memories",
    galleryHint: "tap to view photos",
    photos: photos,

    secretPhoto: secretPhoto || '',
    secretTitle: secretPhoto ? "One Special Moment..." : '',
    secretCaption: secretPhoto ? "Happy 19th Birthday, Fiddia Aissatur Risqi sayangku! Always love u ❤️" : '',

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 19th Birthday,",
    closingTitle2: "Fiddia Sayang 🎂",
    closingParagraph: "Happy 19th Birthday once again, Fiddia Aissatur Risqi sayangku. Thank you for bringing so much love into my life. Tetap jadi pribadi yang baik dan tersenum selalu yaa. Aku sayang banget sama kamu! ❤️✨",
    celebrateBtnText: "celebrate ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Fiddia Aissatur Risqi",
    customerName: customerName,
    theme: "blush-pink",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);

  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
