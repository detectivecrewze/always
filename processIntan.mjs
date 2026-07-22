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
  const kvId = 'auto-dzli8s2';
  const orderId = 'ORD-MRT8TJ7E';
  const customerName = 'intan';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 15 words
  const words = ["Happy", "Birthday", "Buat", "Cowo", "Paling", "Ganteng", "Gemoy", "Dan", "Paling", "Aku", "Sayang", "Sedunia", "I", "Love", "You"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Dimas Juliana",
    sender: "Intan",
    theme: "ocean-breeze",
    musicUrl: "FILL_MANUALLY: Risk it all - Bruno Mars",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy 25th Birthday,",
    heroLine2: "Ayy Sayangku 🥺💖",
    heroSubtitle: "Celebrating the day my favorite person was born. Hari yang paling spesial buat aku.",
    
    timeEnabled: true,
    timeTitle: "A Beautiful Life",
    timeSubtitle: "making the world a better place since",
    timeStartDate: "2001-07-27",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To",
    introHeadline2: "My",
    introHeadline3: "Everything",
    introText: [
      "Happy birthday buat cowo paling ganteng, paling gemoy, paling nyebelin, tapi paling aku sayang seduniaa 🥹💞",
      "Hari ini spesial banget, karena ini hari lahirnya manusia yang paling sering bikin aku senyum-senyum sendiri liat layar HP kayak orang kesurupan cinta 😭💞",
      "Selamat bertambah umur yaa cintakuu. Semoga sehat selalu, rezekinya lancar kayak jalan tol pas tengah malem, dan cita-citanya tercapai. Aamiin paling serius 😭🙏🏻",
      "Aku bersyukur banget bisa kenal kamu. Dari miliaran manusia di bumi, kenapa harus kamu? Ya karena kamu spesial. Gantengnya spesial, lucunya spesial, nyebelinnya juga spesial 😭✋🏻",
      "Makasih yaa udah bertahan sama aku yang kadang random, manja, ngeselin, dan bikin pusing. Tapi tetep lucu dan menggemaskan kan? 😌💅🏻",
      "Makasih udah jadi tempat aku cerita, tempat pulang, tempat manja, dan tempat nyari ribut kalau lagi nganggur 😭❤️ Semoga kita bisa terus bareng-bareng dan bikin banyak cerita bahagia."
    ],
    introSignOff: "With all my love, Intan",

    reasonsTitle1: "6 Things I'm",
    reasonsTitle2: "Grateful For",
    reasonsHintTap: "tap to read more",
    reasonsHintAll: "✨ why i love you ✨",
    reasons: [
      {
        icon: "🏡",
        title: "Being My Safe Place",
        desc: "Makasih udah jadi tempat aku cerita, tempat aku pulang, dan tempat aku manja."
      },
      {
        icon: "💅",
        title: "Loving My Randomness",
        desc: "Makasih udah mau bertahan sama aku yang kadang random, ngeselin, dan bikin pusing."
      },
      {
        icon: "📱",
        title: "Making Me Smile",
        desc: "Kamu manusia yang paling sering bikin aku senyum-senyum sendiri liat HP tiap hari."
      },
      {
        icon: "🥺",
        title: "Being So Special",
        desc: "Dari miliaran manusia di bumi, aku bersyukur banget yang aku suka itu kamu."
      },
      {
        icon: "💍",
        title: "Looking Forward",
        desc: "Terlanjur nyaman, terlanjur cinta, dan terlanjur ngebayangin masa depan bareng kamu."
      },
      {
        icon: "🎁",
        title: "The Best Gift",
        desc: "Hari ini ultah kamu, tapi hadiah terbaiknya justru aku yang dapet karena punya kamu."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to view closer",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "I love you today, tomorrow, and forever 🤍😭✨",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy Birthday",
    closingTitle2: "Cowo Favoritku 🤍",
    closingParagraph: "Semoga di umur baru ini kamu makin bahagia. Kalau ada masalah semoga diberi jalan keluar. Kalau kangen, langsung video call aja! Pokoknya, semoga hubungan kita awet terus sampai nanti kita debat soal undangan nikah, anak kita mirip siapa, dan warna cat rumah. I love you today, tomorrow, and forever. Happy birthday, my favorite person. 🥹❤️🎂",
    celebrateBtnText: "cuddle time ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Dimas Juliana",
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
