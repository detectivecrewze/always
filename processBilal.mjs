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
  const orderId = 'ORD-MRIYJRIU';
  const kvId = 'auto-wynrhyr';

  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  
  const baseWords = [
    "Happy", "29th", "Birthday", "Cintaku", "Thank", "You", "For", 
    "Being", "A", "Great", "Woman", "I", "Love", "You", "Forever", 
    "And", "Always", "Bi", "My", "Future", "Wife", "Let", "Me", 
    "Take", "Care", "Of", "You", "Now", "And", "Forever"
  ];
  const words = baseWords.slice(0, orderPhotos.length);
  while (words.length < orderPhotos.length) {
    words.push("❤️");
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
    recipient: 'Atika Dalima Vurry',
    nickname: 'Cintaku',
    theme: 'vintage-burgundy',
    gateTitle: 'Something Special For u',
    gateSubtitle: 'Something Special For u',
    heroPreTitle: 'happy 29th birthday',
    heroLine1: 'To My Future Wife,',
    heroLine2: 'Cintaku',
    heroSubtitle: '29 beautiful years of you. Let me take on all your responsibilities, now and forever.',
    timeEnabled: true,
    timeTitle: 'Your Journey',
    timeStartDate: '1997-07-15', // Corrected from 2026 to 1997
    introPreTitle: 'a letter for you',
    introHeadline1: 'Selamat',
    introHeadline2: 'Ulang Tahun,',
    introHeadline3: 'Cintaku,',
    introText: [
      "Semoga kamu selalu sehat, panjang umur, dan dilimpahkan banyak wangsit yaa sayang.",
      "Terima kasih telah hidup dan bertahan dengan sangat baik di dunia ini ya bi.",
      "Aku selalu berharap semoga hidupmu akan terus dikelilingi oleh hal-hal baik yang bikin kamu bahagia.",
      "Aku sangat bersyukur punya kamu, wanita yang selalu ada untuk dukung aku dalam keadaan apapun.",
      "Maka dari itu, tujuan terbesarku saat ini adalah menikahimu. Semoga Allah menyertai ucapanku ini.",
      "Terima kasih telah menjadi wanita yang sangat hebat, kuat, punya karir yang bagus, dan independen.",
      "Tapi ingat ya bi, jika saat bersamaku, tolong hilangkan itu semuanya.",
      "Let me take on all your responsibilities. ❤️"
    ],
    introSignOff: 'Love always, Bilal Febryan',
    reasonSectionTitle: 'Beautiful Moments With You',
    reasons: [
      {
        title: 'Saat Kamu Mendukungku',
        desc: 'Setiap kali kamu kasih dukungan di masa sulit, aku merasa jadi pria paling beruntung.'
      },
      {
        title: 'Ketangguhanmu',
        desc: 'Melihat kamu jadi wanita independen dan pekerja keras selalu bikin aku makin kagum.'
      },
      {
        title: 'Menjadi Tempat Bersandar',
        desc: 'Momen pas kamu lepas semua bebanmu dan cerita sama aku adalah hal yang paling berharga.'
      },
      {
        title: 'Tawa Kecil Kita',
        desc: 'Bercanda bareng kamu selalu sukses bikin semua rasa capekku hilang begitu saja.'
      },
      {
        title: 'Kelembutan Hatimu',
        desc: 'Cara kamu memperlakukan orang-orang di sekitar selalu sukses bikin hatiku makin hangat.'
      },
      {
        title: 'Merencanakan Masa Depan',
        desc: 'Setiap kali kita ngobrolin soal pernikahan, aku makin yakin kalau kamu orang yang tepat.'
      }
    ],
    photos,
    closingLine: 'Let me take care of you.',
    sender: 'Bilal',
    secretPhoto,
    secretCaption: 'Semoga Allah mempermudah niat baik kita. ❤️',
    closingPreTitle: 'once again,',
    closingTitle1: 'Happy',
    closingTitle2: 'Birthday',
    closingParagraph: 'Semoga Allah mempermudah niat baik kita untuk terus bersama sampai pelaminan. Terima kasih sudah hadir dan jadi bagian terpenting di hidupku. Aku akan selalu ada buat kamu, Cintaku. ❤️',
    celebrateBtnText: 'celebrate ✨',
    musicUrl: 'FILL_MANUALLY: Mesra mesraannya kecil kecilan dulu - Sal Priadi'
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipient: 'Atika Dalima Vurry',
    theme: 'vintage-burgundy',
    createdAt: new Date().toISOString()
  };

  console.log('Saving gift data...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log('Saving draft data...');
  await cfSet(`draft:${kvId}`, draftData);

  console.log(`✅ Done! Gift for Atika (${kvId}) has been saved.`);
  console.log(`🎵 REMINDER: Fill musicUrl manually for "Mesra mesraannya kecil kecilan dulu - Sal Priadi" in Studio Editor!`);
}

main().catch(console.error);
