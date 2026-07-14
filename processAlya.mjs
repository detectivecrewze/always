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
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function cfSet(key, value) {
  const body = typeof value === 'string' ? value : JSON.stringify(value);
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body
  });
  return res.ok;
}

const orderId = 'ORD-MRH6DA4O';
const kvId = 'gift-1783819150948';

async function processOrder() {
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Gallery words: 3 words to match 3 photos
  const words = ["Happy", "Birthday", "Sayang"];
  
  const photos = [];
  // Loop based on actual available photos
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }
  
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    recipient: "Sayangku",
    theme: "ocean-breeze",
    music: {
      file: "FILL_MANUALLY: team choose",
      title: "Team Choice",
      artist: "Unknown"
    },
    
    gateSubtitle: "sebuah catatan rasa",
    gateTitle: "Untuk Kamu",
    
    heroPreTitle: "happy birthday",
    heroLine1: "Teruntuk",
    heroLine2: "Sayang",
    heroSubtitle: "Waktu yang berlalu dengan segala ceritanya.",
    
    timeEnabled: true,
    timeTitle: "Waktu Berjalan",
    timeSubtitle: "dimulai sejak",
    timeStartDate: "2012-10-10",
    
    introIcons: ["🎂", "🥺", "🤍"],
    introPreTitle: "tentang kita",
    introHeadline1: "Happy",
    introHeadline2: "14th",
    introHeadline3: "Birthday",
    introText: [
      "Happy birthday yaa sayang. Terimakaciii karena selama ini udah sabar banget ngadepin aku yang kadang egois, suka cemburuan, dan marah-marah nggak jelas.",
      "Tapi jujur... waktu kita lagi berantem dan kamu malah nyari pelarian dengan VC cewek lain, itu bener-bener bikin aku hancur.",
      "Padahal kamu sering banget share video 'kalau berantem jangan bawa orang ketiga', tapi nyatanya kamu sendiri yang ngelakuin itu.",
      "Pas kamu ketahuan, aku nangis sejadi-jadinya. Hatiku rasanya hancur banget karena aku bener-bener udah se-percaya itu sama kamu.",
      "Dan walau rasanya sakit banget liat kelakuan kamu, anehnya aku malah tetep milih buat peluk kamu, maafin kamu, dan bilang 'iya gapapa'.",
      "Yaudahlah mau gimana lagi kan, namanya juga sayang. Semoga ke depannya kamu bisa lebih baik lagi dan nepatin omonganmu sendiri yaa."
    ],
    introSignOff: "Penuh harap,\nAlya",
    
    reasonsTitle1: "Jejak",
    reasonsTitle2: "Waktu",
    reasons: [
      {
        title: "Rasa Sabarmu",
        desc: "Makasih ya udah sabar banget ngadepin sifat egois dan cemburuan aku selama ini."
      },
      {
        title: "Rasa Kecewa",
        desc: "Waktu itu jujur aku hancur banget pas tahu kamu nyari kenyamanan di cewek lain."
      },
      {
        title: "Rasa Percaya",
        desc: "Padahal aku udah naruh semua rasa percayaku ke kamu, tapi malah dipatahin gitu aja."
      },
      {
        title: "Tetap Bertahan",
        desc: "Walau sakit, aku tetep milih buat peluk kamu dan maafin semua kesalahan kamu."
      },
      {
        title: "Harapan Baru",
        desc: "Semoga di umur yang baru ini, kamu bisa belajar buat ngehargain kepercayaan orang lain."
      },
      {
        title: "Yaudahlah",
        desc: "Yaudahlah mau gimana lagi, aku cuma berharap ke depannya kita bisa sama-sama lebih baik."
      }
    ],
    
    photos: photos,
    galleryTitle1: "Cerita",
    galleryTitle2: "Kita",
    
    closingPreTitle: "tetap sayang",
    closingTitle1: "Happy Sweet 14th",
    closingTitle2: "Sayang",
    closingParagraph: "Selamat ulang tahun ke-14 yaa sayang. Semoga panjang umur dan apa yang kamu semogakan bisa terwujud. Pesanku cuma satu, tolong hargai orang yang udah beneran tulus sayang sama kamu. I'm always trying my best for you.",
    closingLine: "yang selalu maafin kamu,",
    sender: "Alya",
    celebrateBtnText: "miss you ✨",
    
    secretPhoto: secretPhoto,
    secretCaption: "semoga kita lebih baik. 🤍",
    secretVideoMuted: false
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    customerName: "Alya",
    recipientName: "sayang",
    deadline: "2026-07-20T10:00",
    theme: "ocean-breeze",
    moment: "Ultah",
    status: "done",
    createdAt: new Date().toISOString()
  };

  await cfSet(`gift:${kvId}`, giftData);
  console.log(`✅ Successfully saved gift:${kvId}`);

  await cfSet(`draft:${kvId}`, draftData);
  console.log(`✅ Successfully saved draft:${kvId}`);
}

processOrder().catch(console.error);
