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

const orderId = 'ORD-MRHLSYF6';
const kvId = 'auto-5vw7rqh';

async function processOrder() {
  console.log(`Fetching order ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Gallery words: 5 words to match 5 photos
  const words = ["I", "Still", "Love", "You", "Kevin"];
  
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
    recipient: "Bg Kevin",
    theme: "ocean-breeze",
    music: {
      file: "FILL_MANUALLY: aku milik mu- dewa 19",
      title: "Aku Milik Mu",
      artist: "Dewa 19"
    },
    
    gateSubtitle: "from someone who misses you",
    gateTitle: "Untuk Kevin",
    
    heroPreTitle: "happy birthday",
    heroLine1: "Manusia Favorit",
    heroLine2: "Akuu",
    heroSubtitle: "17th years of my favorite person.",
    
    timeEnabled: true,
    timeTitle: "Perjalanan Hidupmu",
    timeSubtitle: "been glowing since",
    timeStartDate: "2009-07-31",
    
    introIcons: ["🎂", "✨", "🤍"],
    introPreTitle: "a little note",
    introHeadline1: "Happy",
    introHeadline2: "17th",
    introHeadline3: "Birthday",
    introText: [
      "Shalom bg, dibaca yaa bg!!",
      "Happy birthday manusia favorit akuuu! 🥳",
      "Doa terbaik buat kamuu, semoga semua cita-cita kamu bisa terwujud yaa! I really mean it.",
      "Semoga harapan kecil maupun besarnya kebahagiaan kamu bisa jadi kenyataan yaa, cintaa 🤍",
      "Semoga kamu bisa banggain orang tua dan adik-adik kamu yaa. Jangan kecewain mereka, karena kamu itu contoh yang baik buat adik-adikmu.",
      "Btw... aku masih secinta itu sama kamu, and I still love you so much.",
      "Maafin aku yaa kalau aku pernah jadi orang yang egois, mungkin waktu itu aku sempet bikin kamu kecewa.",
      "Aku seneng banget pernah jadi bagian dari hidup kamu, and honestly, aku masih ngarep kita bisa balikan lagi 😓",
      "I miss you so much. I love you, Kevin 🤍🤍"
    ],
    introSignOff: "With love,\nTikaa",
    
    reasonsTitle1: "My Feelings",
    reasonsTitle2: "For You",
    reasons: [
      {
        title: "Orang Baik",
        desc: "Kamu tuh orang baik banget, dan aku selalu berdoa semoga kamu juga selalu dikelilingi orang baik."
      },
      {
        title: "Manusia Favoritku",
        desc: "You will always be my favorite person. Nggak akan ada yang bisa gantiin posisi kamu di hatiku."
      },
      {
        title: "Maafin Aku Yaa",
        desc: "Aku bener-bener minta maaf atas semua egoisnya aku waktu itu. I'm so sorry."
      },
      {
        title: "Masih Sayang",
        desc: "Btw aku masih secinta dan sesayang itu sama kamu, and I just can't deny it."
      },
      {
        title: "Harapanku",
        desc: "Aku masih sering berharap kita bisa balik kayak dulu lagi, dan jadi bagian dari hidup kamu lagi."
      },
      {
        title: "Role Model",
        desc: "Kamu itu contoh yang baik buat adik-adikmu, so keep making them proud yaa bg!"
      }
    ],
    
    photos: photos,
    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    
    closingPreTitle: "i miss you",
    closingTitle1: "Happy Sweet 17th",
    closingTitle2: "Bg Kevin",
    closingParagraph: "Once again, happy sweet 17th birthday bg Kevin. Semoga hari ini jadi yang terbaik buat kamu. I'm always here if you need me. I miss you.",
    closingLine: "from your,",
    sender: "Tikaa",
    celebrateBtnText: "miss you ✨",
    
    secretPhoto: secretPhoto,
    secretCaption: "happy 17th, love. 🤍",
    secretVideoMuted: false
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    customerName: "tikaa",
    recipientName: "kevin julian",
    deadline: "2026-07-29T00:00",
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
