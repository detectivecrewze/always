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
  const kvId = 'auto-dggjk0f';
  const orderId = 'ORD-MRX5609T';
  const customerName = 'tata (gitul)';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const photos = [];
  if (photoCount > 0) {
    const words = [
      "Happy", "Eighteenth", "Birthday", "Almas", "Bubb",
      "Terima", "Kasih", "Sudah", "Jadi", "Rumah",
      "Terindah", "Dalam", "Hidupku", "Ya", "🤍"
    ];
    for (let i = 0; i < photoCount; i++) {
      photos.push({
        url: orderPhotos[i] || '',
        caption: words[i] || ''
      });
    }
  }

  const giftData = {
    recipient: "Almas (Bubb)",
    sender: "Tata (Gitul)",
    theme: "midnight-blue",
    musicUrl: "FILL_MANUALLY: I'd like to watch you sleeping - Sal Priadi",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy 18th Birthday,",
    heroLine2: "Almas Bubb ❤️",
    heroSubtitle: "Merayakan hari lahirmu, sosok terkasih yang selalu menjadi rumah tempatku berpulang.",
    
    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing warmth and comfort into the world since",
    timeStartDate: "2008-07-30",

    introPreTitle: "a letter from the heart",
    introHeadline1: "Untuk",
    introHeadline2: "Almas Bubb",
    introHeadline3: "Tersayang",
    introText: [
      "Happy birthday to u cintakuu! Selamat bertambah usiaa bubb, di umur yang ke-18 inii aku berdoa semoga kamu selaluu dalam lindungan Allah SWT. Selaluu sehatt, selaluu baikk, dan menjadii seseorang yang selaluu ingin tumbuh menjadii lebih baikk. Jadi pribadi yang lebih baikk buat diri sendirii dan orang lainn yaa bubb.",
      "Aku akan jadi seseorang yang selalu bangga sama kamu, sama perjalanan kamu. Aku akan selaluu support keinginan kamuu, hobi kamuu, dan hal-hal lain yg kamuu lagii tekuninn. Aku akan selalu disini nemenin kamuu. Kalo kamu butuhin orang buat hal apapun kabarin aku okayy? Aku akan selaluu ada buat kamuu dimanapun dan kapanpunn.",
      "Sayang kalo kamu merasa dunia kamu terasa beratt, ada aku disinii yang bisa buatt sedikitt kesenangann dan ketenangan buat kamu sayangg. Akuu akan terus disinii nemenin kamuu, menjadii tempat mengeluh kamu, cerita kamuu, menjadii rumahh yg bukan berbentuk rumahh eheheh.",
      "Terimakasii sudaa adaa buat akuu bubb, selaluu temeninn akuu, akuu happyy bisaa kenall amaa kamuuu. Aku sayang kamuu, selaluu setiap hari, setiap jam, menit, dan detiknyaa. Rasa sayangg akuuu bertumbuhh dan bertambahh setiapp harinyaa. Akuu akann selaluu sayangg kamuu cintaa kamuu eheh.",
      "Sekalii lagii happy birthday sayangg, haruss bahagiaa di harii yangg penuhh rasa bahagiaa!! Semoga hal baik selalu ada di samping kamu teruss, semoga di umur kamu yangg sekarang apapun yang kamu impikan di umur sebelumnya bisa terwujud yaa. Semoga panjang umur, sehat selalu, murah rezeki, jangan pernah nyerah dalam hal apapun itu ya untuk umur kamu yg baru dan untuk kedepan nya.",
      "Ujian apapun itu, seberat apapun itu nanti kamu jalanin nya harus tabah ookeyy? Kamu pasti bisa lewatin ujian-ujian yang kamu hadapi. Kalauu kamuu lagii capee, kamuu bisaa ceritaa samaa akuuu. Ingat yaa jangan lupa baik sama diri kamu sendiri sebelum kamu baik sama orang lain, aku ga maksa kamu buat jadi siapa-siapa, aku mau kamu jadi diri kamu sendiri. Terimakasih udaa sekuat ini, banyak hal yangg udaa kamu lewati dan banyak juga yangg belum kamu alami.",
      "Semakin dewasa semakin banyak tantangan yangg kamu alami, but it's okeyy selagi kamu yakin sama diri sendiri dan takdir semua akan baik-baik aja percaya deh. Sesedih apapun jangan lupa untuk selalu bersyukur ya, semoga banyak kebahagiaan yg kembali pada hari ini, semoga harimu jauh lebih menyenangkan dari apa yg kamu inginkan. Sekali lagi selamat ulang tahun yaa, jangan lupa untuk selalu ceria makasii udaa bertahan hingga umur kamu yang sekarang, teruss begini sampai kedepan nya yya!! 🤍💗",
      "Semoga hal baik selalu beriringan denganmu. Teruslah tumbuh, melangkah maju, dan meraih impian-impianmu. Aku akan melihatmu berproses, menjadi saksi dari setiap perjuangan dan pencapaianmu.",
      "Meski tak selalu hadir di dekatmu, aku akan selalu mendukungmu dengan doa dan harapan terbaik. Ketika kamu merasa lelah atau ragu, ingatlah bahwa ada seseorang yang selalu percaya padamu, yang selalu bangga dengan setiap langkahmu, baik itu besar maupun kecil.",
      "Aku akan selalu menjadi orang yang paling bangga dengan setiap prosesmu, dengan setiap keberhasilan dan bahkan kegagalanmu. Karena bagiku, melihatmu berusaha dan tumbuh adalah kebahagiaan tersendiri. Teruslah melangkah, aku akan selalu mendukungmu."
    ],
    introSignOff: "With all my love, Tata (Gitul)",

    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "You Are Special",
    reasonsHintTap: "tap the card to reveal",
    reasonsHintAll: "✨ precious qualities ✨",
    reasons: [
      {
        icon: "🏠",
        title: "My Safest Home",
        desc: "Makasih udah jadi tempat mengeluh, cerita, dan rumah non-fisik yang paling nyaman buat aku."
      },
      {
        icon: "🌟",
        title: "Your True Self",
        desc: "Aku selalu suka kamu jadi diri kamu sendiri tanpa perlu kepaksa buat jadi orang lain."
      },
      {
        icon: "💪",
        title: "Your Strong Spirit",
        desc: "Makasih yaa udah sekuat ini dan tabah banget melewati setiap rintangan sampai umur 18."
      },
      {
        icon: "☀️",
        title: "Pure Comfort",
        desc: "Kehadiranmu selalu bawa sedikit kesenangan dan ketenangan di saat duniaku terasa berat."
      },
      {
        icon: "💖",
        title: "Endless Love",
        desc: "Rasa sayang aku ke kamu bertumbuh dan bertambah setiap hari, jam, menit, dan detiknya."
      },
      {
        icon: "🚀",
        title: "Always Proud",
        desc: "Aku bakal selalu jadi orang pertama yang paling bangga sama setiap proses dan perjuangan kamu."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to enlarge",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Happy 18th Birthday, Almas bubb! ❤️",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 18th",
    closingTitle2: "Birthday 🎂",
    closingParagraph: "Happy 18th Birthday once again, Almas bubb sayang. Terima kasih sudah menjadi rumah terbaik dan bertahan hingga sekuat ini. Aku akan selalu ada di sampingmu untuk mendukung setiap langkah dan impianmu. I love you so much! ❤️",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Almas (Bubb)",
    customerName: customerName,
    theme: "midnight-blue",
    createdAt: new Date().toISOString(),
    status: "draft"
  };

  console.log(`Saving generated gift and draft for ${kvId}...`);
  await cfSet(`draft:${kvId}`, draftData);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Order ${orderId} processed successfully as ${kvId}!`);
}

main().catch(console.error);
