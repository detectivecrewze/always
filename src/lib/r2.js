/**
 * Cloudflare R2 via REST API (no AWS SDK needed)
 */

const BASE = () =>
  `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${process.env.R2_BUCKET_NAME}/objects`;

const authHeader = () => ({
  Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
});

export function isR2Configured() {
  return !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_API_TOKEN &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL
  );
}

export function getPublicUrl(key) {
  const base = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
  return `${base}/${key}`;
}

export async function uploadFile(key, buffer, contentType) {
  const res = await fetch(`${BASE()}/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: {
      ...authHeader(),
      'Content-Type': contentType,
    },
    body: buffer,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`R2 upload failed: ${res.status} ${txt}`);
  }
  return { url: getPublicUrl(key) };
}

export async function deleteFile(key) {
  const res = await fetch(`${BASE()}/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`R2 delete failed: ${res.status}`);
  }
}
