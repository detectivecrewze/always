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
  const orderId = 'ORD-MRK6ACIM';
  const kvId = 'auto-gui8jdi';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  // Words matching exact photo count
  const baseWords = [
    "Happy", "Birthday", "Sayang", "I", "Am", "So", "Proud", 
    "Of", "You", "Always", "I", "Miss", "You", "So", "Much"
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
    recipient: 'Andra Eka Wahyu Saputra',
    nickname: 'Sayang',
    theme: 'vintage-burgundy',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy birthday',
    heroLine1: 'To My Hero,',
    heroLine2: 'Sayang',
    heroSubtitle: '21 beautiful years of your journey. I am beyond proud to call you mine.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '2005-07-15',
    introPreTitle: 'a letter for you',
    introHeadline1: 'Happy',
    introHeadline2: 'Birthday,',
    introHeadline3: 'Sayang,',
    introText: [
      "Happy Birthday to the man who owns my heart. Semoga di usiamu yang baru ini, setiap langkahmu selalu dijaga oleh-Nya, dan semua doa-doa baikmu perlahan menemukan jalannya untuk terkabul.",
      "Sayang, I just want you to know how incredibly proud I am of you.",
      "Aku tau kegiatanmu di batalyon lagi padat-padatnya dan pasti capek banget, but please remember that I am always here cheering for you from afar.",
      "This distance between us is definitely not easy, rindu rasanya bisa ngabisin banyak waktu sama kamu kayak dulu lagi...",
      "And I am so sorry for all those times aku sering ngambek dan marah-marah nggak jelas. Trust me, di balik omelan itu, aslinya aku sayang banget sama kamu.",
      "Semoga kamu terus dikasih kesehatan dan kekuatan buat jalanin hari-hari beratmu di sana ya.",
      "Anyway, cepet-cepet di-upgrade dong statusku ini, masa mau jadi pacar terus? Ditunggu loh ajakan halalnya, hehehe."
    ],
    introSignOff: 'Love always, Your Beautiful Girl',
    reasonSectionTitle: 'Our Precious Moments',
    reasons: [
      {
        title: 'My Proudest Moment',
        desc: 'Ngeliat kamu berjuang keras di batalyon bikin aku sadar kalau I fell for a truly amazing man.'
      },
      {
        title: 'Those Random Fights',
        desc: 'Setiap kali kita berantem kecil, di situlah aku belajar bahwa cinta kita selalu lebih besar dari ego.'
      },
      {
        title: 'Our Old Days',
        desc: 'Kadang aku suka senyum-senyum sendiri kalau inget memori pas kita masih bisa ketemu setiap hari.'
      },
      {
        title: 'The Long Distance',
        desc: 'Jarak ini ngajarin aku kalau being far from you is hard, but loving you is always worth it.'
      },
      {
        title: 'Your Endless Patience',
        desc: 'Makasih udah selalu sabar ngadepin aku yang kadang bawel dan suka marah-marah ini.'
      },
      {
        title: 'A Future to Build',
        desc: 'Ngebayangin masa depan bareng kamu selalu jadi alasan terkuat buat aku terus bertahan.'
      }
    ],
    photos,
    closingLine: 'Distance means so little when someone means so much.',
    sender: 'Your Beautiful Girl',
    secretPhoto,
    secretCaption: 'I miss you, tolong cepet halalin aku ya! ✨',
    closingPreTitle: 'here is to us,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'No matter how far you are, you will always be my home. Stay safe di sana ya sayang. Happy birthday, and hopefully soon, happy wedding for us! ✨',
    celebrateBtnText: 'miss you ✨',
    musicUrl: 'FILL_MANUALLY: Shape of my heart - backstreet boys'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Andra Eka Wahyu Saputra',
    theme: 'vintage-burgundy',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Andra (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Music choice was 'Shape of my heart - backstreet boys'. Manually set musicUrl in Studio!`);
}

main().catch(console.error);
