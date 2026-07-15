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
  const kvId = 'gift-1784050734140';
  const orderId = 'ORD-MRKZ3RAR';
  
  console.log(`Fetching order data from ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  const words = ["Happy", "25th", "Birthday", "Baby", "I", "Love", "You", "More", "Than", "Words", "Can", "Say", "Forever", "Yours"];
  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    gateTitle: "Something Special For u",
    recipient: "Inesta",
    musicUrl: "FILL_MANUALLY: Yellow - cold play",
    theme: "vintage-burgundy",
    
    heroLine1: "To My Precious,",
    heroLine2: "Baby",
    heroLine3: "25 years of you bringing laughter and light into my world.",
    
    timeTitle: "Your Journey",
    timeStartDate: "2001-07-17",
    
    introText: [
      "Happy 25th Birthday, Baby! 🎉",
      "Makasih ya udah ada di hidupku, walau kita tahu kadang banyak banget masalah yang datang wkwk.",
      "Tapi ya tak apa, lewati saja dan jalani sesuai dengan apa yang kita inginkan.",
      "Walau kadang realita tak sesuai harapan, yaudah jalan aja lurus terus 😭🤣, yang penting kita selalu ingat sama komitmen kita berdua.",
      "Maaf juga ya kalo selama ini aku merasa gabisa banyak membantu dirimu untuk berkembang menjadi lebih baik.",
      "Ya dah itu aja pesannya... gatau males pengen beli truck aja rasanya hahaha.",
      "Semoga di umur yang ke-25 ini, kamu makin bahagia dan kita bisa terus jalan lurus bareng-bareng. I love you!"
    ],
    introSignOff: "Love, Bruce",
    
    reasons: [
      {
        title: "Awal Cerita Kita",
        desc: "Setiap detik bersamamu adalah awal cerita yang takkan pernah aku sesali."
      },
      {
        title: "Melewati Masalah",
        desc: "Walau kadang banyak drama, bareng kamu semua terasa lebih mudah dilewati."
      },
      {
        title: "Jalan Lurus Terus",
        desc: "Jalani aja semuanya ke depan, selama tanganku masih menggenggam tanganmu."
      },
      {
        title: "Komitmen Kita",
        desc: "Komitmen kita adalah jangkar yang menahan kita saat badai datang."
      },
      {
        title: "Tumbuh Bersama",
        desc: "Mungkin aku belum sempurna, tapi aku selalu ingin jadi versi terbaik buatmu."
      },
      {
        title: "Beli Truck Bareng",
        desc: "Bahkan saat aku bilang pengen beli truck, kamu tetap jadi alasan bahagiaku."
      }
    ],
    
    photos: photos,
    secretPhoto: secretPhoto,
    secretCaption: "Makasih udah bertahan sampai detik ini. You mean everything to me.",
    
    closingTitle1: "Happy Birthday",
    closingTitle2: "Baby",
    closingText: "Apapun yang terjadi ke depan, entah jalannya lurus atau berkelok, aku ingin terus berada di sampingmu.",
    celebrateBtnText: "celebrate ✨"
  };

  console.log(`Saving gift data for ${kvId}...`);
  await cfSet(`gift:${kvId}`, giftData);
  
  // also create the draft just in case
  console.log(`Saving draft data for ${kvId}...`);
  await cfSet(`draft:${kvId}`, giftData);

  console.log('✅ Done! Gift processed successfully.');
}

main().catch(console.error);
