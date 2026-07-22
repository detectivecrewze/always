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
  const kvId = 'gift-1784638477185';
  const orderId = 'ORD-MRURBTLS';
  const customerName = 'Khusnil';

  console.log(`Fetching order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';

  const photoCount = orderPhotos.length;
  // Needs exactly 8 words
  const words = ["Happy", "Level", "Up", "Day", "Revi", "Cantik", "Kesayanganku", "🤍"];

  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  const giftData = {
    recipient: "Revi Cantik",
    sender: "Khusnil",
    theme: "vintage-burgundy",
    musicUrl: "FILL_MANUALLY: Risk it all - Bruno Mars",
    gateSubtitle: "Something Special For u",
    
    heroLine1: "Happy Level Up Day,",
    heroLine2: "Revi Cantik 🌷",
    heroSubtitle: "Celebrating the day you were born and reminding you how much you mean to everyone.",
    
    timeEnabled: true,
    timeTitle: "A Beautiful Life",
    timeSubtitle: "making the world a better place since",
    timeStartDate: "2009-07-22",

    introPreTitle: "a letter from the heart",
    introHeadline1: "To",
    introHeadline2: "My",
    introHeadline3: "Favorite",
    introText: [
      "Happy level up day!!! Make a wish for your birthday. Tahun ini umur kamu bertambah satu tahun, semoga kamu selalu sehat dan apapun yang kamu inginkan semoga bisa terjadi.",
      "Terima kasih sudah sekuat ini dan bertahan hidup. Banyak hal yang sudah kamu laluin dan masih banyak hal yang belum kamu laluin.",
      "Semakin kamu dewasa, semakin banyak juga rintangannya. But it's okayyy, karena masih banyak orang yang sayang sama kamu. Apapun susahnya, apapun senangnya, nikmati dan selalu bersyukur ya.",
      "Semoga harimu jauh lebih menyenangkan dan banyak kebahagiaan yang datang ke dalam hidupmu. Terima kasih sudah menjadi kuat selama ini, selanjutnya harus selalu kuat, ceria, dan bahagia yaaa sayangg 🌷💓✨",
      "Aku ingin membuat sesuatu yang sedikit berbeda untuk ulang tahunmu tahun ini. Anggaplah ini sebagai pengingat kecil betapa berartinya dirimu bagiku, dan bagi siapa pun yang beruntung memilikimu dalam hidup mereka."
    ],
    introSignOff: "With all my heart, Khusnil",

    reasonsTitle1: "6 Beautiful",
    reasonsTitle2: "Qualities",
    reasonsHintTap: "tap to read more",
    reasonsHintAll: "✨ why you are amazing ✨",
    reasons: [
      {
        icon: "💪",
        title: "Your Strength",
        desc: "Terima kasih sudah sekuat ini dan bertahan menghadapi semua hal yang udah kamu laluin."
      },
      {
        icon: "👼",
        title: "Beautiful Soul",
        desc: "Pribadi kamu yang bikin siapapun merasa beruntung bisa memiliki kamu di hidup mereka."
      },
      {
        icon: "😊",
        title: "Keep Smiling",
        desc: "Harapan aku supaya kamu terus ceria dan bahagia ngelewatin semua rintangan ke depannya."
      },
      {
        icon: "🙏",
        title: "Always Grateful",
        desc: "Kemampuan kamu buat nikmati dan bersyukur di setiap keadaan, baik susah maupun senang."
      },
      {
        icon: "💖",
        title: "So Meaningful",
        desc: "Mengingatkan kamu betapa berartinya dirimu bagiku dan banyak orang yang sayang sama kamu."
      },
      {
        icon: "🌱",
        title: "Growing Up",
        desc: "Semakin kamu dewasa, aku yakin kamu bakal jadi sosok yang jauh lebih kuat lagi."
      }
    ],

    galleryTitle1: "Captured",
    galleryTitle2: "Moments",
    galleryHint: "tap to view closer",
    photos: photos,

    secretPhoto: secretPhoto,
    secretTitle: "One More Thing...",
    secretCaption: "Terima kasih sudah sekuat ini 🌷💓✨",

    closingPreTitle: "always & forever",
    closingTitle1: "Happy Birthday",
    closingTitle2: "Revi Cantik 🤍",
    closingParagraph: "Sekali lagi selamat ulang tahun yaaa. Semoga semua harapan yang diinginkan menjadi kenyataan. I will always be here for you, no matter what.",
    celebrateBtnText: "make a wish ✨"
  };

  const draftData = {
    id: kvId,
    orderId: orderId,
    recipientName: "Revi Cantik",
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
