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
  const orderId = 'ORD-MRKG8MWY';
  const kvId = 'gift-1784018616491';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Happy", "25th", "Birthday", "Sayang", "Thank", "You", "For", "Fighting", 
    "For", "Us", "I", "Love", "You", "So", "Much"
  ];
  const words = baseWords.slice(0, orderPhotos.length);
  while (words.length < orderPhotos.length) {
    words.push("✨");
  }

  const photos = [];
  for (let i = 0; i < orderPhotos.length; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const giftData = {
    id: kvId,
    recipient: 'Bestari Yulisa Putri Pertiwi',
    nickname: 'Sayang',
    theme: 'blush-pink',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 25th birthday',
    heroLine1: 'To My Precious,',
    heroLine2: 'Sayang',
    heroSubtitle: '25 beautiful years of your journey. Thank you for always fighting for our love.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2001-07-15',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Birthday,',
    introHeadline3: 'Sayang,',
    introText: [
      "Selamat ulang tahun sayang, semoga kamu makin dewasa dan makin bijak dalam ngambil keputusan apapun itu.",
      "Makasih ya sayangku, kamu udah mau berjuang dan selalu usaha dari dulu sampai detik ini untuk bertahan sama aku.",
      "Makasih banget udah mau berusaha supaya kita nggak LDR, sampai kamu rela nyari kerjaan di Bandung.",
      "Makasih ya sayang udah sabar ngikutin kemauan dan keegoisan aku selama ini.",
      "Maafin aku yang telat sadar dan telat intropeksi diri. Ke depannya, tolong jangan capek ya buat bawelin aku lagi, buat minta ini itu ke aku.",
      "Aku pengen kamu bisa terbuka lagi kayak dulu, bawel lagi kayak dulu, dan apa-apa selalu cerita ke aku.",
      "Pelan-pelan yaa kita tumbuhin lagi rasa-rasa yang dulu pernah ada.",
      "Kita usaha bareng-bareng terus ya, supaya tahun depan beneran jadi nikah.",
      "I love you so much, sayanggg."
    ],
    introSignOff: 'Love always, Dewangga',
    reasonSectionTitle: 'Things I Appreciate About You',
    reasons: [
      {
        title: 'Your Endless Effort',
        desc: 'Makasih udah mau berjuang dan bertahan sama aku dari dulu sampai detik ini.'
      },
      {
        title: 'Ending The Distance',
        desc: 'Aku sangat menghargai usahamu mencari kerja di Bandung supaya kita nggak LDR lagi.'
      },
      {
        title: 'Your Great Patience',
        desc: 'Makasih udah selalu sabar ngikutin kemauan dan keegoisanku selama ini.'
      },
      {
        title: 'Beautiful Forgiveness',
        desc: 'Maafin aku yang kadang telat sadar, aku janji bakal terus intropeksi diri jadi lebih baik.'
      },
      {
        title: 'Stay Talkative',
        desc: 'Jangan pernah capek buat bawelin aku, aku kangen kamu yang selalu terbuka soal apa aja.'
      },
      {
        title: 'Our Future Vows',
        desc: 'Ayo pelan-pelan kita usaha bareng supaya tahun depan impian kita buat nikah bisa terwujud.'
      }
    ],
    photos,
    closingLine: 'Here is to our forever.',
    sender: 'Dewangga',
    secretPhoto,
    secretCaption: 'I love you, let us make it real next year.',
    closingPreTitle: 'here is to us,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Pelan-pelan kita bangun lagi semuanya ya sayang. Aku bakal terus berusaha buat jadi lebih baik. Happy 25th Birthday, and cheers to our wedding next year.',
    celebrateBtnText: 'happy birthday ✨',
    musicUrl: 'FILL_MANUALLY: team choose'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Bestari Yulisa Putri Pertiwi',
    theme: 'blush-pink',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Bestari (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Let Team Decide'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
