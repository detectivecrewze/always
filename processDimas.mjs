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
  const kvId = 'gift-1785036375238';
  const orderId = 'ORD-MS1AR2QU';
  const customerName = 'Dimas';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const photos = [];
  if (photoCount > 0) {
    const words = [
      "Happy", "25th", "Birthday", "My", "Dearest",
      "Ulya", "Zahra", "Thank", "You", "For",
      "Being", "My", "Home", "Always", "🌸"
    ];
    for (let i = 0; i < photoCount; i++) {
      photos.push({
        url: orderPhotos[i] || '',
        caption: words[i] || ''
      });
    }
  }

  const giftData = {
    recipient: "Ulya Zahra",
    sender: "Dimas",
    theme: "blush-pink",
    musicUrl: "FILL_MANUALLY: Meant 2 Be - Shakira Jasmine, Nuca",
    gateSubtitle: "Something Special For u",
    
    heroPreTitle: "a special 25th birthday wish",
    heroLine1: "Happy 25th Birthday,",
    heroLine2: "My Precious Ulya Zahra 🌸",
    heroSubtitle: "25 beautiful years of your presence making the world a brighter place.",
    
    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing warmth & light into the world since",
    timeStartDate: "2001-07-28",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To My",
    introHeadline2: "Dearest Ulya",
    introHeadline3: "With Love",
    introText: [
      "Empat tahun lalu aku nggak pernah menyangka kalau seseorang yang awalnya cuma hadir sebagai orang baru di hidupku, sekarang bisa menjadi orang yang paling aku syukuri setiap harinya.",
      "Terima kasih ya sudah bertahan sejauh ini. Terima kasih sudah selalu memilih aku, bahkan di saat hubungan kita nggak selalu mudah. Kita pernah melewati LDR, rasa rindu yang cuma bisa ditahan lewat telepon, video call, chat, dan menghitung hari sampai akhirnya bisa bertemu lagi. Walaupun jauh, kamu selalu berhasil bikin aku merasa dekat.",
      "Aku tahu aku bukan pacar yang sempurna. Masih sering bikin kamu kesel, kadang egois, kadang susah mengungkapkan apa yang aku rasakan. Tapi percayalah, setiap hari aku selalu berusaha menjadi seseorang yang pantas untuk terus berjalan di sampingmu.",
      "Aku bangga melihat kamu tumbuh menjadi perempuan yang kuat, baik hati, penyayang, dan selalu berusaha memberikan yang terbaik untuk orang-orang di sekitarmu. Aku berharap di usia yang baru ini semua doa baikmu satu per satu dikabulkan. Semoga Allah selalu menjaga kesehatanmu, melapangkan jalanmu, mempermudah pekerjaanmu, memberikan rezeki yang berkah, dan menjadikanmu perempuan yang selalu bahagia.",
      "Kalau suatu hari nanti hidup terasa berat, semoga kamu selalu ingat kalau kamu nggak harus menghadapinya sendirian. Aku ingin tetap menjadi orang pertama yang kamu cari untuk berbagi cerita, tertawa, bahkan menangis.",
      "Aku punya satu harapan sederhana. Semoga ini bukan hanya ulang tahun keempat yang aku rayakan bersamamu. Semoga masih ada ulang tahun kelima, keenam, kesepuluh, bahkan puluhan tahun berikutnya yang bisa kita rayakan bersama.",
      "Terima kasih sudah menjadi rumah, tempat pulang, sekaligus alasan aku percaya bahwa cinta bisa bertahan sejauh ini. Aku mencintaimu hari ini, besok, dan selama Tuhan masih mengizinkan kita berjalan bersama. Happy 25th Birthday, Ulya Zahra sayang... 🌸🎂"
    ],
    introSignOff: "With all my heart, Dimas",

    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "I'm So Grateful For You",
    reasonsHintTap: "tap to reveal",
    reasonsHintAll: "✨ reasons why you mean the world to me ✨",
    reasons: [
      {
        icon: "🤍",
        title: "Daily Blessing",
        desc: "Empat tahun berjalan dan kamu selalu jadi sosok yang paling aku syukuri setiap harinya."
      },
      {
        icon: "🌉",
        title: "Through Every Distance",
        desc: "Terima kasih sudah selalu bertahan dan memilih aku walau rindu harus terpisah LDR."
      },
      {
        icon: "👑",
        title: "Strong & Loving",
        desc: "Bangga banget melihat kamu tumbuh jadi wanita yang kuat, baik hati, dan penyayang."
      },
      {
        icon: "🏡",
        title: "Safe Harbor",
        desc: "Aku ingin tetap jadi orang pertama tempatmu berbagi cerita, tawa, maupun tangis."
      },
      {
        icon: "⏳",
        title: "Endless Celebrations",
        desc: "Semoga ada puluhan ulang tahun berikutnya yang bisa terus kita rayakan bersama."
      },
      {
        icon: "🌸",
        title: "Place to Call Home",
        desc: "Terima kasih sudah jadi rumah dan alasan aku percaya bahwa cinta bisa bertahan sejauh ini."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Memories",
    galleryHint: "tap to view photos",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy 25th Birthday, Ulya Zahra sayang! I love you so much 🌸",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 25th",
    closingTitle2: "Birthday 🎂",
    closingParagraph: "Happy 25th Birthday once again, Ulya Zahra sayang. Thank you for being my home, my safe place, and my greatest blessing. I love you today, tomorrow, and as long as God allows us to walk side by side. 🌸",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Ulya Zahra",
    customerName: customerName,
    theme: "blush-pink",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
