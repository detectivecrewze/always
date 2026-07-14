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
  const orderId = 'ORD-MRK6H58S';
  const kvId = 'auto-0si0bh8';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Gallery quotes matching exact photo count
  const baseWords = [
    "Happy", "1st", "Anniversary", "Sayang", "Thank", "You", "For", 
    "Being", "My", "Home", "I", "Love", "You", "So", "Much"
  ];
  const words = baseWords.slice(0, orderPhotos.length);
  while (words.length < orderPhotos.length) {
    words.push("💗");
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
    recipient: 'Silmi nur azizah',
    nickname: 'Sayang',
    theme: 'vintage-burgundy',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 1st anniversary',
    heroLine1: 'To My Beautiful,',
    heroLine2: 'Sayang',
    heroSubtitle: '365 hari yang penuh dengan tawa, rindu, dan cinta. Terima kasih sudah menjadi tempat ternyaman untuk pulang.',
    timeEnabled: true,
    timeTitle: '365 Days with You',
    timeStartDate: '2025-07-14', // 1 year ago from today roughly
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Anniversary,',
    introHeadline3: 'Sayang,',
    introText: [
      "Anggap ini sebagai pengingat kecil tentang betapa berartinya kamu bagiku.",
      "Nggak kerasa ya, 365 hari kita udah sama-sama.",
      "Setahun yang isinya penuh tawa, berantem-berantem kecil, kangen-kangenan tapi susah buat ketemu...",
      "...dan yang terpenting, kita selalu saling nguatin pas lagi capek-capeknya.",
      "Makasih sayang, udah jadi orang yang luar biasa sabar ngadepin aku yang kadang nyebelin ini.",
      "Makasih karena kamu ngajarin aku kalau cinta itu bukan cuma tentang seneng bareng-bareng aja.",
      "Aku nggak janji bisa jadi cowok yang sempurna buat kamu...",
      "Tapi aku janji bakal terus belajar jadi 'rumah' yang bikin kamu ngerasa aman, nyaman, dan disayang setiap hari 💗"
    ],
    introSignOff: 'Love always, Ramdan',
    reasonSectionTitle: 'Our 365 Days',
    reasons: [
      {
        title: 'Tawa Bersama',
        desc: 'Hari-hari berat selalu kerasa lebih ringan tiap denger kamu ketawa lepas.'
      },
      {
        title: 'Berantem Kecil',
        desc: 'Bahkan dari ngambeknya kamu, aku belajar buat jadi lebih sabar dan ngertiin kamu.'
      },
      {
        title: 'Rindu & Jarak',
        desc: 'Susah ketemu ngajarin kita kalau rasa kangen itu yang bikin kita makin kuat.'
      },
      {
        title: 'Saling Nguatin',
        desc: 'Pas dunia lagi jahat dan bikin capek, cuma kamu yang bisa jadi tempat sandaranku.'
      },
      {
        title: 'Kesabaran Kamu',
        desc: 'Makasih udah nggak nyerah ngadepin segala kurangnya aku setahun ini.'
      },
      {
        title: 'Rumah Untukmu',
        desc: 'Aku bakal terus pastiin kamu selalu ngerasa aman dan nyaman tiap sama aku.'
      }
    ],
    photos,
    closingLine: 'You are my safe place.',
    sender: 'Ramdan',
    secretPhoto,
    secretCaption: 'I promise to always be your home. 💗',
    closingPreTitle: 'here is to us,',
    closingTitle1: 'Happy',
    closingTitle2: 'Anniversary',
    closingParagraph: 'Semoga 365 hari yang udah kita lewati ini jadi awal buat ribuan hari bahagia lainnya. Sekali lagi, aku janji bakal terus belajar jadi rumah ternyaman buat kamu sayang.',
    celebrateBtnText: 'happy anniversary ✨',
    musicUrl: 'FILL_MANUALLY: Risk it all bruno mars'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Silmi nur azizah',
    theme: 'vintage-burgundy',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Silmi (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Risk it all bruno mars'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
