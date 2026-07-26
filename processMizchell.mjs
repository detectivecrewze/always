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
  const kvId = 'auto-ib5abtp';
  const orderId = 'ORD-MS0LLN2P';
  const customerName = 'Mizchell';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const words = [
    "Happy", "32nd", "Birthday", "Fatiha", "Sayang",
    "Thank", "You", "For", "Being", "My",
    "Sweetest", "Memory", "In", "Life", "🤍"
  ];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Fatiha (Sayang)",
    sender: "Mizchell",
    theme: "classic-light",
    musicUrl: "FILL_MANUALLY: On Bended Knee - Boyz II Men",
    gateSubtitle: "Something Special For u",
    
    heroPreTitle: "to my dearest one",
    heroLine1: "Happy 32nd Birthday,",
    heroLine2: "Fatiha Sayang 🤍✨",
    heroSubtitle: "Merayakan 32 tahun perjalanan usiamu, ulang tahun kedua kita bersama dan kenangan manis yang selalu aku genggam.",
    
    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing warmth, lessons, and light into the world since",
    timeStartDate: "1994-07-26",

    introPreTitle: "a letter from the bottom of my heart",
    introHeadline1: "For",
    introHeadline2: "My Dearest",
    introHeadline3: "Fatiha",
    introText: [
      "Happy birthday yaa sayang... 🤍✨ Ini ulang tahun kedua kamu sama aku, semoga kamu juga bisa ada di next ulang tahun aku. Doaku selalu yang baik-baik untukmu.",
      "Gak terasa udah satu setengah tahun kita kenal, gak lama tapi juga gak bisa dibilang sebentar. Aku belum cukup untuk kenal kamu lebih lagi, so aku harap kita bisa sama-sama lebih lama walau aku tahu gak mungkin selamanya.",
      "Akhir-akhir ini juga lagi banyak cobaan di kita, ego kamu dan ego aku. Semoga gak jadi alasan kita buat menyerah satu sama lain. Aku emang sering bilang aku capek sama kamu, tapi belum saatnya untuk aku menyerah. Aku masih pegang semua kata-kata dan janji-janji kamu ke aku.",
      "Aku tahu kamu laki-laki yang harusnya bertanggung jawab atas semua omongan dan perbuatanmu, dan aku harap pandanganku ke kamu itu gak salah yaa, jangan buat aku benci ke kamu di akhir perjalanan kita.",
      "Pokoknya aku sayang banget sama kamu, aku berdoa supaya gak ada yang namanya menyerah untuk sama kamu. Kamu gak akan aku lupain sampai kapan pun, dari ketikanmu, kata-katamu, bahkan gestur kecilmu juga akan aku ingat terus.",
      "Bahagia selalu yaa, semoga jodohmu cepat datang serta rezekimu mengalir untukmu dan keluarga kecilmu nantinya walau bukan sama aku. Aku cinta kamu, dan rasa cintaku lebih besar dari yang kamu bayangkan.",
      "Semoga kamu bisa anggap aku sebagai sweetest memories even cuma 0,1% dari hidupmu, dan semoga suatu saat ada hal-hal kecil yang tetap mengingatkan kamu tentang aku.",
      "In another life, aku mau kita sememungkinkan itu untuk bareng selamanya. Terima kasih atas segalanya, I love you so much, I love you to the moon, I love you in every universe! 🌙✨🤍"
    ],
    introSignOff: "With all my love & sweetest memories, Mizchell",

    reasonsTitle1: "6 Precious",
    reasonsTitle2: "Memories & Qualities",
    reasonsHintTap: "tap the card to reveal",
    reasonsHintAll: "✨ holding onto every word & gesture ✨",
    reasons: [
      {
        icon: "⏳",
        title: "1.5 Years Together",
        desc: "Satu setengah tahun mengenalmu, perjalanan singkat yang menyimpan begitu banyak arti."
      },
      {
        icon: "🤍",
        title: "Holding Your Promises",
        desc: "Aku masih memegang teguh semua kata-kata dan janji manis yang pernah kamu ucapkan."
      },
      {
        icon: "💭",
        title: "Every Little Gesture",
        desc: "Dari ketikanmu, kata-katamu, bahkan gestur kecilmu selalu tersimpan rapi di ingatanku."
      },
      {
        icon: "🤝",
        title: "Never Giving Up",
        desc: "Biarpun ego dan ujian menghampiri, aku selalu berdoa agar tak ada kata menyerah untuk kita."
      },
      {
        icon: "✨",
        title: "Sweetest Memories",
        desc: "Aku bersyukur dan berharap bisa menjadi salah satu kenangan manis di perjalanan hidupmu."
      },
      {
        icon: "🌙",
        title: "In Every Universe",
        desc: "Terima kasih atas segalanya. I love you to the moon, and I love you in every universe."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to enlarge",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy 32nd Birthday, Fatiha sayang! I love you in every universe 🤍✨",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 32nd",
    closingTitle2: "Birthday 🎂✨",
    closingParagraph: "Happy 32nd Birthday once again, Fatiha sayang. Terima kasih atas satu setengah tahun yang penuh warna dan kenangan indah. Bahagia dan sukses selalu untukmu. In another life, I hope we can stay together forever. I love you so much! 🤍✨",
    celebrateBtnText: "in another life ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Fatiha (Sayang)",
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
