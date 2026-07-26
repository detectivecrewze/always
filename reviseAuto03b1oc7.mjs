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
  const kvId = 'auto-03b1oc7';
  console.log(`Fetching existing gift for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);
  if (!gift) {
    console.error(`Gift ${kvId} not found!`);
    return;
  }

  // Update reasons
  gift.reasons = [
    {
      icon: "🥰",
      title: "Cara Abang Nyayangin Aku",
      desc: "Aku selalu ngerasa disayang lewat hal-hal kecil yang abang lakuin. Sesimpel itu, tapi selalu bikin aku seneng."
    },
    {
      icon: "🤍",
      title: "Sabar Abang",
      desc: "Gatau udah berapa kali aku ngambek, tapi abang tetap sabar ngadepin aku."
    },
    {
      icon: "🔥",
      title: "Semangat Abang",
      desc: "Aku paling suka lihat abang yang nggak pernah nyerah buat ngejar apa yang abang mau."
    },
    {
      icon: "😊",
      title: "Senyum Abang",
      desc: "Senyum abang tuh selalu berhasil bikin mood aku balik lagi."
    },
    {
      icon: "🥺",
      title: "Perhatian Abang",
      desc: "Aku suka cara abang selalu mastiin aku baik-baik aja. Hal kecil, tapi berarti buat aku."
    },
    {
      icon: "✨",
      title: "Jadi Diri Sendiri",
      desc: "Ga usah jadi siapa-siapa. Cukup jadi abang yang sekarang aja, itu udah jadi favorit aku."
    }
  ];

  // Enable PIN gate + hint
  gift.pinEnabled = true;
  gift.pinCode = "211125";
  gift.pinHint = "lupa? ku jual akun ml mu 150k";

  // Enable Seasons section
  gift.seasonsTitle1 = "A Wish For";
  gift.seasonsTitle2 = "Every Season";
  gift.seasonsHint = "tap each card to read a message";
  gift.seasons = [
    {
      icon: "☀️",
      name: "Happy Moments",
      teaser: "Summer",
      message: "Happy birthday ya, Bang. Semoga di umur yang baru ini abang makin banyak ketawa, makin banyak bahagianya, dan semoga tahun ini lebih baik dari tahun kemarin."
    },
    {
      icon: "🍂",
      name: "Keep Growing",
      teaser: "Autumn",
      message: "Semoga abang tetap jadi abang yang aku kenal. Tetap semangat ngejar semua yang abang mau, pelan-pelan juga pasti sampai."
    },
    {
      icon: "❄️",
      name: "Stay Strong",
      teaser: "Winter",
      message: "Kalau lagi capek atau banyak pikiran, jangan dipendem sendiri ya. Aku harap abang selalu kuat, dan ingat kalau ada aku yang bakal nemenin."
    },
    {
      icon: "🌸",
      name: "A New Chapter",
      teaser: "Spring",
      message: "Selamat datang di umur 20, Bang. Semoga semua doa dan usaha abang pelan-pelan dikabulin. Semoga kita juga masih terus bikin banyak cerita baru bareng. 🤍"
    }
  ];

  console.log(`Saving updated gift for ${kvId}...`);
  await cfSet(`gift:${kvId}`, gift);
  console.log(`✅ Gift ${kvId} revised successfully!`);
}

main().catch(console.error);
