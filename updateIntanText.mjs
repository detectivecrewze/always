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
  const kvId = 'auto-dzli8s2';
  console.log(`Fetching current gift for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);
  
  if (!gift) {
    console.error("Gift not found!");
    return;
  }

  // Set the full original message as introText
  gift.introText = [
    "Happy birthday buat cowo paling ganteng, paling gemoy, paling nyebelin, tapi paling aku sayang seduniaa 🥹💞",
    "Hari ini hari spesial banget, karena hari ini adalah hari lahirnya manusia yang paling sering bikin aku senyum-senyum sendiri liat layar HP kayak orang kesurupan cinta 😭💞",
    "Selamat bertambah umur yaa cintakuu. Semoga panjang umur, sehat selalu, rezekinya lancar kayak jalan tol pas tengah malem, cita-citanya tercapai, dan semoga saldo rekeningnya ikut bertambah secara signifikan. Aamiin paling serius 😭🙏🏻",
    "Aku bersyukur banget bisa kenal kamu. Dari miliaran manusia di bumi, kenapa harus kamu yang aku suka? Ya karena kamu spesial. Gantengnya spesial, lucunya spesial, nyebelinnya juga spesial 😭✋🏻",
    "Makasih yaa udah bertahan sama aku yang kadang random, kadang manja, kadang ngeselin, kadang bikin pusing, tapi lucu dan menggemaskan kan? 😌💅🏻",
    "Makasih juga udah nemenin aku sampai sejauh ini. Udah jadi tempat aku cerita, tempat aku pulang, tempat aku manja, dan tempat aku nyari ribut kalau lagi nganggur 😭❤️",
    "Semoga kita bisa terus bareng-bareng, bikin banyak cerita, banyak ketawa, banyak foto lucu buat dikenang nanti, dan bikin kenangan yang bakal selalu kita inget sampai kapan pun 🥺💞",
    "Semoga di umur yang baru ini kamu makin bahagia. Kalau ada masalah, semoga selalu diberi jalan keluar. Kalau lagi capek, semoga selalu dikasih kekuatan. Dan kalau lagi kangen aku, semoga langsung video call aja jangan dipendem 😭📞💖",
    "Pokoknya aku cuma mau bilang... Selamat ulang tahun yaa sayangkuuu 🤍",
    "Semoga hubungan kita awet terus sampai nanti kita debat hal-hal penting seperti: \"Undangan nikah mau berapa lembar?\" 😭💍 dan \"Anak kita mirip siapa?\" 👶🏻 \"Warna cat rumah kita apa?\" 🏡",
    "Aku sayang banget sama kamu. Jangan pernah bosen sama aku yaa, karena aku udah terlanjur nyaman, terlanjur cinta, dan terlanjur ngebayangin masa depan sama kamu 🥺💖",
    "Sekali lagi, happy birthday cowo favoritku. Hari ini ulang tahun kamu, tapi hadiah terbaiknya justru aku yang dapet... karena aku masih punya kamu 🤍😭✨",
    "I love you today, tomorrow, and forever. Happy birthday, my favorite person. 🥹❤️🎂"
  ];

  // Improvise a new closing paragraph based on the sentiment
  gift.closingParagraph = "Sekali lagi, happy birthday yaa sayang! Makasih udah jadi cowok favorit aku yang selalu sabar ngadepin semua ke-random-an aku. Yuk kita bikin lebih banyak kenangan indah bareng-bareng sampai semua obrolan masa depan kita beneran jadi nyata. Love you forever! ✨";
  
  console.log(`Saving updated gift for ${kvId}...`);
  await cfSet(`gift:${kvId}`, gift);
  console.log(`✅ Text sections updated successfully!`);
}

main().catch(console.error);
