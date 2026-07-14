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
  const kvId = 'auto-mey61yk';

  console.log(`Fetching current gift data for ${kvId}...`);
  const giftData = await cfGet(`gift:${kvId}`);
  if (!giftData) {
    console.error(`Error: Could not find gift:${kvId}`);
    return;
  }

  // Update birth year to 2000 to match age 26
  if (giftData.timeStartDate) {
    giftData.timeStartDate = '2000-07-18';
  }

  // Update hero texts
  if (giftData.heroPreTitle) {
    giftData.heroPreTitle = giftData.heroPreTitle.replace('24th', '26th').replace('24', '26');
  }
  if (giftData.heroSubtitle) {
    giftData.heroSubtitle = giftData.heroSubtitle.replace('24', '26');
  }

  // Update introText
  if (giftData.introText && Array.isArray(giftData.introText)) {
    giftData.introText = giftData.introText.map(line => 
      line.replace('24th', '26th').replace('24', '26')
    );
  }

  // Update photo captions (words) if there's '24th'
  if (giftData.photos && Array.isArray(giftData.photos)) {
    giftData.photos = giftData.photos.map(photo => {
      if (photo.caption) {
        photo.caption = photo.caption.replace('24th', '26th').replace('24', '26');
      }
      return photo;
    });
  }

  // Update closing paragraph just in case
  if (giftData.closingParagraph) {
    giftData.closingParagraph = giftData.closingParagraph.replace('24th', '26th').replace('24', '26');
  }

  console.log('Saving updated gift data (age to 26)...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log(`✅ Done! Age elements for Azzurra's order (${kvId}) have been updated from 24 to 26.`);
}

main().catch(console.error);
