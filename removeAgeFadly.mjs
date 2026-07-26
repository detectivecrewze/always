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
  const kvId = 'gift-1782411431396';
  console.log(`Fetching gift data for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);
  if (!gift) {
    console.error('Gift not found!');
    return;
  }

  // Remove age counter section completely
  gift.timeEnabled = false;

  // Clean up any remaining text to make sure no age numbers exist
  gift.heroLine1 = "Happy Birthday,";
  gift.heroLine2 = "Donna Zulfa 🤍✨";
  gift.heroSubtitle = "Celebrating your special day, the most precious person who makes every single moment brighter.";
  gift.closingTitle1 = "Happy";
  gift.closingTitle2 = "Birthday 🎂✨";
  gift.closingParagraph = "Happy Birthday once again, my dearest Donna. May your day be as beautiful and wonderful as you are. Remember that you are deeply cherished today, tomorrow, and forever. I love you so much! 🤍✨";

  await cfSet(`gift:${kvId}`, gift);
  console.log(`✅ Successfully removed all age references and hidden age section for ${kvId}!`);
}

main().catch(console.error);
