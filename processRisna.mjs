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
  const kvId = 'auto-kfzytms';
  const orderId = 'ORD-MRUA8HBJ';
  const customerName = 'Risna';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    recipient: "Risna pricillia",
    sender: "Risna",
    theme: "ocean-breeze",
    musicUrl: "FILL_MANUALLY: team choose",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Selamat Ulang Tahun,",
    heroLine2: "Sayangku 🤍",
    heroSubtitle: "Merayakan hari spesialmu yang ke-31, semoga selalu diberikan kebahagiaan.",
    
    timeEnabled: true,
    timeTitle: "Cerita Tentangmu",
    timeSubtitle: "dunia jadi lebih indah sejak",
    timeStartDate: "1995-07-25",

    introPreTitle: "sebuah pesan manis",
    introHeadline1: "Untuk",
    introHeadline2: "Kesayangan",
    introHeadline3: "Hati",
    introText: [
      "Selamat ulang tahun! 🎉",
      "Makin tua dikit nggak apa-apa yaa, yang penting makin bahagia, makin sukses, dan yang pasti harus makin sayang sama aku.",
      "Semoga semua doa baik sayang dikabulkan di umur yang baru ini.",
      "Semoga Allah kasih kemudahan dan jalan buat kita untuk berjodoh, serta meluluhkan hati keluarga kita berdua.",
      "Aku akan terus berjuang dan berdoa sama-sama kamu, sampai hari indah itu datang 🤍"
    ],
    introSignOff: "Penuh doa, Risna",

    reasonsTitle1: "6 Momen",
    reasonsTitle2: "Penuh Harapan",
    reasonsHintTap: "sentuh kartunya yaa",
    reasonsHintAll: "✨ perjuangan dan cinta kita ✨",
    reasons: [
      {
        icon: "🎂",
        title: "Momen Bertambah Umur",
        desc: "Ngerayain ulang tahun kamu lagi, makin tua dikit nggak apa-apa asal makin bahagia."
      },
      {
        icon: "🤲",
        title: "Doa dan Harapan",
        desc: "Momen di mana aku selalu selipin nama kamu di setiap doaku supaya dikasih jalan terbaik."
      },
      {
        icon: "🥰",
        title: "Makin Sayang",
        desc: "Liat kamu yang tiap hari makin dewasa dan pastinya bikin aku makin sayang."
      },
      {
        icon: "🤍",
        title: "Berjuang Bersama",
        desc: "Momen-momen kita terus berdoa dan berusaha supaya Allah kasih jalan buat kita berjodoh."
      },
      {
        icon: "⏳",
        title: "Kesabaran Kita",
        desc: "Sabar nunggu dan berusaha di waktu yang tepat untuk meluluhkan hati keluarga."
      },
      {
        icon: "💍",
        title: "Masa Depan",
        desc: "Ngebayangin suatu saat nanti perjuangan kita berdua bakal berbuah manis bahagia."
      }
    ],

    galleryTitle1: "Kumpulan",
    galleryTitle2: "Kenangan Kita",
    galleryHint: "ketuk fotonya buat liat lebih deket yaa",
    photos: [],

    secretPhoto: secretPhoto,
    secretTitle: "Satu Lagi...",
    secretCaption: "Doa terbaik selalu buat kita 🤍",

    closingPreTitle: "doa dan harapan",
    closingTitle1: "I Love You",
    closingTitle2: "Sayang 🤍",
    closingParagraph: "Semoga di umur yang baru ini kamu terus dikasih kesehatan, kebahagiaan, dan kelancaran buat semua urusan. Aku selalu doain yang terbaik dari sini. Semangat terus ya sayang, kita pasti bisa lewatin semua ini sama-sama sampai akhir.",
    celebrateBtnText: "peluk erat ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Risna pricillia",
    customerName: customerName,
    theme: "ocean-breeze",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
