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
  const kvId = 'auto-r60kf7a';
  const orderId = 'ORD-MS21V6OL';
  const customerName = 'araaaa';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  const photos = [];
  if (photoCount > 0) {
    const words = [
      "Happy", "18th", "Birthday", "My", "Favorite",
      "Person", "Thank", "You", "For", "Being",
      "In", "My", "Life", "❤️"
    ];
    for (let i = 0; i < photoCount; i++) {
      photos.push({
        url: orderPhotos[i] || '',
        caption: words[i] || ''
      });
    }
  }

  const giftData = {
    recipient: "abayyyy",
    sender: "araaaa",
    theme: "midnight-blue",
    musicUrl: "FILL_MANUALLY: team choose",
    gateSubtitle: "Something Special For u",

    pinEnabled: true,
    pinCode: "123456",
    pinHint: "131225",

    heroPreTitle: "a special 18th birthday wish",
    heroLine1: "Happy 18th Birthday,",
    heroLine2: "My Dearest Abayyyy 💕",
    heroSubtitle: "18 beautiful years of your presence making the world a brighter place.",

    timeEnabled: true,
    timeTitle: "The Story of You",
    timeSubtitle: "bringing light into the world since",
    timeStartDate: "2008-08-01",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To My",
    introHeadline2: "Dearest Abayyyy",
    introHeadline3: "With All My Love",
    introText: [
      "Happy level up day, Abayyyy! 🎂🎉 Make a wish for u birthday... Tahun ini umur kamu bertambah satu tahun dan jatah hidup kamu berkurang satu tahun juga. Semoga kamu selalu sehat, makin dewasa, dan apapun yang kamu impikan bisa terwujud yaa.",
      "Terima kasih udah lahir di dunia ini dan bertahan hidup sejauh ini. Banyak hal yang udah kamu laluin, dan masih banyak hal yang belum kamu laluin. Semakin kamu dewasa pasti semakin banyak juga rintangannya... But it's okayy, karena masih banyak orang yang sayang sama kamu, salah satunya akuuu! ><",
      "Apapun susahnya, apapun sedihnya, dan apapun senangnya, kamu nikmatin dan bersyukur yaa. Semoga banyak kebahagiaan yang kembali dari hari ini, semoga semua harapan yang kamu inginkan menjadi kenyataan, dan semoga harimu jauh lebih menyenangkan sesuai dengan harapanmu.",
      "Sekali lagi selamat ulang tahun yaa sayang! Terima kasih udah menjadi kuat selama ini walaupun awalnya dikuat-kuatin aja, dan selanjutnya harus selalu kuat, ceria, dan bahagia yaa!! Love you so much! ❤️✨"
    ],
    introSignOff: "With all my love, araaaa",

    reasonsTitle1: "6 Reasons Why",
    reasonsTitle2: "I'm So Grateful For You",
    reasonsHintTap: "tap to reveal",
    reasonsHintAll: "✨ reasons why you mean the world to me ✨",
    reasons: [
      {
        icon: "🌟",
        title: "Unstoppable Strength",
        desc: "Bangga banget melihat Abay yang selalu kuat dan bertahan ngelewatin semua hal."
      },
      {
        icon: "💖",
        title: "Always By Your Side",
        desc: "Ingat yaa, apapun yang terjadi akan selalu ada aku yang sayang dan nemenin kamu."
      },
      {
        icon: "🌱",
        title: "Growing Gracefully",
        desc: "Semoga di usia 18 tahun ini Abay semakin dewasa dan bijaksana dalam setiap langkah."
      },
      {
        icon: "✨",
        title: "Purest Happiness",
        desc: "Semoga harimu selalu menyenangkan dan dipenuhi kebahagiaan yang tak terhingga."
      },
      {
        icon: "🙏",
        title: "Grateful Existence",
        desc: "Terima kasih sudah lahir ke dunia dan hadir membawa kehangatan buat aku."
      },
      {
        icon: "🤍",
        title: "Brightest Dreams",
        desc: "Semoga semua harapan, cita-cita, dan doa Abay satu per satu segera terwujud."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Memories",
    galleryHint: "tap to view photos",
    photos: photos,

    secretPhoto: secretPhoto || '',
    secretTitle: secretPhoto ? "One Special Video..." : '',
    secretCaption: secretPhoto ? "Happy 18th Birthday, Abayyyy sayang! Always be strong and happy ❤️" : '',

    closingPreTitle: "always & forever",
    closingTitle1: "Happy 18th",
    closingTitle2: "Birthday 🎂",
    closingParagraph: "Happy 18th Birthday once again, Abayyyy sayang. Thank you for 18 wonderful years of your presence and for being my greatest joy. Tetap kuat, ceria, dan bahagia selalu yaa. I love you so much! 💕",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "abayyyy",
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
