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
  const kvId = 'auto-t2yzzv8';
  const orderId = 'ORD-MRTB1ZCC';
  const customerName = 'ajynn';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 15 words
  const words = ["Happy", "18th", "Birthday", "Sayangku", "Cintaku", "Duniaku", "Semoga", "Selalu", "Jadi", "Kebanggaan", "Mas", "I", "Love", "You", "🤍"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Zahra Putri Salsabila",
    sender: "Ajynn",
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: not a lot, just forever",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy 18th Birthday,",
    heroLine2: "Cantiknya Mas 🤍",
    heroSubtitle: "Celebrating the day my favorite person was born. Hari yang sangat spesial buat aku.",
    
    timeEnabled: true,
    timeTitle: "A Beautiful Life",
    timeSubtitle: "making the world a better place since",
    timeStartDate: "2008-07-25",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To",
    introHeadline2: "My",
    introHeadline3: "Everything",
    introText: [
      "HaaloOooo bebeee, selamat ulang tahun yaa cintakuu, manisskuu, duniakuuu...",
      "Hari ini adalah hari yang sangat spesial, karena perempuan yang sangat aku sayangi bertambah usia. Hari di mana ayah dan mamah sangat bangga dan bahagia karena kamu terlahir di dunia.",
      "Zahra Putri Salsabila, itu nama yang sangat indah. Nama yang sangat cantik, persis seperti orangnya.",
      "Sayangkuu, semoga apa yang jadi cita-cita kamu bisa terwujud yaa sayang. Semoga umurnya selalu berkah, panjang usia, dan selalu jadi kebanggaan ayah, mamah, adik kamu, dan juga aku.",
      "Semangat belajar yaaa di sanaa, please jaga diri baik-baik. Aku bener-bener sayang banget sama kamu.",
      "Walaupun kita jauh, kamu selalu ada di hati aku. I will always support you sayang, semoga selalu diberikan kemudahan dan kelancaran."
    ],
    introSignOff: "With all my love, Mas Ajynn",

    reasonsTitle1: "6 Beautiful",
    reasonsTitle2: "Moments",
    reasonsHintTap: "tap to read more",
    reasonsHintAll: "✨ why you are my everything ✨",
    reasons: [
      {
        icon: "🐣",
        title: "The Day You Were Born",
        desc: "Hari kamu dilahirkan, momen di mana ayah, mamah, dan seluruh dunia bahagia menyambutmu."
      },
      {
        icon: "🌸",
        title: "Your Beautiful Name",
        desc: "Momen nyebut nama Zahra Putri Salsabila, nama yang sangat cantik persis kayak orangnya."
      },
      {
        icon: "🌎",
        title: "Our Distance",
        desc: "Walaupun kita jauh, momen LDR ini malah bikin aku sadar kalau kamu selalu ada di hati aku."
      },
      {
        icon: "💪",
        title: "Always Supporting You",
        desc: "Momen ngasih support buat kamu yang lagi semangat belajar di sana. You can do it sayang!"
      },
      {
        icon: "🥺",
        title: "Being My Pride",
        desc: "Terima kasih telah menjadi orang yang sangat aku sayangi dan yang selalu jadi kebanggaan aku."
      },
      {
        icon: "🙏",
        title: "Praying For You",
        desc: "Momen mendoakan yang terbaik untuk perempuan yang sangat aku sayangi di hari ulang tahunnya."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to view closer",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Love u more honeyy 🤍🤍🤍",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy Birthday",
    closingTitle2: "My Love 🤍",
    closingParagraph: "Sekali lagi happy birthday sayangg yang ke delapan belas. Panjang umur selalu yaaa, semoga hari-harimu selalu penuh dengan cinta dan kebahagiaan. Love u moreee honeyy....",
    celebrateBtnText: "miss you ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Zahra Putri Salsabila",
    customerName: customerName,
    theme: "vintage-burgundy",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
