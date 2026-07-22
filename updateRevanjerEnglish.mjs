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
  const kvId = 'auto-dcynpdj';
  console.log(`Fetching current gift for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);
  
  if (!gift) {
    console.error("Gift not found!");
    return;
  }

  // Update introText
  gift.introText = [
    "Happy sweet seventeen for my beautiful girl ❤️🫶🏼🥳",
    "I hope in this new age of yours, you may always live a long and healthy life.",
    "I will always pray for you so that you can keep developing to be better every single day ❤️",
    "I just want to pray for the best for you. Thank you, my love, for coming into my life and making everything so much brighter.",
    "Thank you for coming into my life. I love you baby, I love you always 💞🫂🫶🏼"
  ];

  // Update reasons
  gift.reasons = [
    {
      icon: "✨",
      title: "The First Time",
      desc: "The first time we met, I felt so incredibly lucky that you came into my life."
    },
    {
      icon: "🌱",
      title: "Growing Together",
      desc: "Seeing you keep developing to be better every single day makes me so incredibly proud."
    },
    {
      icon: "🥰",
      title: "Everyday Joy",
      desc: "Every little moment with you always manages to make my days so much happier."
    },
    {
      icon: "🙏",
      title: "Praying for You",
      desc: "The moments I always pray for the best for you, because you deserve nothing but the best."
    },
    {
      icon: "🤍",
      title: "Your Presence",
      desc: "Your presence always reminds me of how truly grateful I am to have you."
    },
    {
      icon: "🫂",
      title: "Loving You Always",
      desc: "Knowing that my love for you will always be there, I love you always baby."
    }
  ];

  // Update closingParagraph
  gift.closingParagraph = "I hope this 17th birthday brings you abundant happiness, my love. I wish you nothing but the best today and always. Enjoy your special day, baby!";

  // Update photo captions
  const newWords = ["Happy", "Sweet", "Seventeen", "My", "Beautiful", "Girl", "I", "Love", "You", "Always", "And", "Forever", "Baby", "🤍", "🫶🏼"];
  if (gift.photos && gift.photos.length === 15) {
    for (let i = 0; i < 15; i++) {
      gift.photos[i].caption = newWords[i];
    }
  }
  
  console.log(`Saving updated gift for ${kvId}...`);
  await cfSet(`gift:${kvId}`, gift);
  console.log(`✅ All text sections updated to English successfully!`);
}

main().catch(console.error);
